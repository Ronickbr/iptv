const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iptv_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

const pool = mysql.createPool(dbConfig)

// Test database connection with retry logic
async function testConnection(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection()
      console.log('✅ Database connected successfully')
      connection.release()
      return true
    } catch (error) {
      console.log(`❌ Database connection attempt ${i + 1}/${retries} failed: ${error.message}`)
      if (i === retries - 1) {
        console.error('❌ All database connection attempts failed. Exiting...')
        process.exit(1)
      }
      console.log(`⏳ Retrying in ${delay/1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' })
    }
    req.user = user
    next()
  })
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IPTV Manager API is running' })
})

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' })
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate user ID
    const userId = require('crypto').randomUUID()
    const clientId = require('crypto').randomUUID()

    // Check if referral code exists and is valid
    let referrerId = null
    if (referralCode) {
      const [referrer] = await pool.execute(
        'SELECT id, user_id FROM clients WHERE referral_code = ?',
        [referralCode.toUpperCase()]
      )
      
      if (referrer.length > 0) {
        referrerId = referrer[0].id
      }
    }

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Insert user
      await connection.execute(
        'INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, email, hashedPassword, 'client', 'active']
      )

      // Generate referral code for new user
      const newReferralCode = name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase()

      // Insert client with referred_by if referral code was valid
      await connection.execute(
        'INSERT INTO clients (id, user_id, referral_code, phone, referred_by) VALUES (?, ?, ?, ?, ?)',
        [clientId, userId, newReferralCode, phone || null, referrerId]
      )

      // If there's a valid referrer, create a referral record
      if (referrerId) {
        const referralId = require('crypto').randomUUID()
        await connection.execute(
          'INSERT INTO referrals (id, referrer_id, referred_id, status, created_at) VALUES (?, ?, ?, ?, NOW())',
          [referralId, referrerId, clientId, 'pending']
        )

        // Update referrer's total_referrals count
        await connection.execute(
          'UPDATE clients SET total_referrals = total_referrals + 1 WHERE id = ?',
          [referrerId]
        )
      }

      await connection.commit()
      connection.release()

      res.status(201).json({ 
        message: 'Conta criada com sucesso',
        user: { id: userId, name, email, role: 'client' }
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' })
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    const user = users[0]

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Conta inativa' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    )

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Protected routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, status, created_at, last_login FROM users WHERE id = ?',
      [req.user.userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const user = users[0]

    // Get client data if user is a client
    if (user.role === 'client') {
      const [clients] = await pool.execute(
        'SELECT * FROM clients WHERE user_id = ?',
        [user.id]
      )

      if (clients.length > 0) {
        user.client = clients[0]
      }
    }

    res.json({ profile: user })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const stats = {}

    if (req.user.role === 'admin') {
      // Admin stats
      const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "client"')
      const [activeSubscriptions] = await pool.execute('SELECT COUNT(*) as count FROM subscriptions WHERE status = "active" AND end_date > NOW()')
      const [totalRevenue] = await pool.execute('SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments WHERE status = "completed"')

      stats.totalUsers = userCount[0].count
      stats.activeSubscriptions = activeSubscriptions[0].count
      stats.totalRevenue = totalRevenue[0].total
    } else {
      // Client stats
      const [client] = await pool.execute('SELECT * FROM clients WHERE user_id = ?', [req.user.userId])
      
      if (client.length > 0) {
        const clientId = client[0].id
        
        // Get active subscription
        const [subscription] = await pool.execute(
          `SELECT s.*, sp.name as plan_name, sp.max_devices 
           FROM subscriptions s 
           JOIN subscription_plans sp ON s.plan_id = sp.id 
           WHERE s.client_id = ? AND s.status = 'active' AND s.end_date > NOW() 
           ORDER BY s.created_at DESC LIMIT 1`,
          [clientId]
        )

        stats.subscription = subscription[0] || null
        stats.totalPoints = client[0].total_points
        stats.totalReferrals = client[0].total_referrals
      }
    }

    res.json({ stats })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get subscription plans
app.get('/api/plans', async (req, res) => {
  try {
    const [plans] = await pool.execute(
      'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY sort_order ASC, price ASC'
    )

    res.json({ plans })
  } catch (error) {
    console.error('Plans error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' })
  }
  next()
}

// ===== ADMIN ROUTES =====

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Simplificar a query para evitar problemas com parâmetros
    const [users] = await pool.execute(
      `SELECT u.*, 
              c.phone, c.total_points, c.total_referrals, c.referral_code,
              (SELECT COUNT(*) FROM subscriptions s WHERE s.client_id = c.id AND s.status = 'active') as active_subscriptions
       FROM users u 
       LEFT JOIN clients c ON u.id = c.user_id 
       ORDER BY u.created_at DESC 
       LIMIT 50`
    )

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM users`
    )

    res.json({
      users,
      pagination: {
        page: 1,
        limit: 50,
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / 50)
      }
    })
  } catch (error) {
    console.error('Admin users error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update user status (admin only)
app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' })
    }

    await pool.execute(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    )

    res.json({ message: 'Status do usuário atualizado com sucesso' })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Create user (admin only)
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nome, email, senha e tipo são obrigatórios' })
    }

    if (!['admin', 'client'].includes(role)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido' })
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate user ID
    const userId = require('crypto').randomUUID()

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Insert user
      await connection.execute(
        'INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, email, hashedPassword, role, 'active']
      )

      // If role is client, create client record
      if (role === 'client') {
        const clientId = require('crypto').randomUUID()
        const referralCode = name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase()
        
        await connection.execute(
          'INSERT INTO clients (id, user_id, referral_code, phone) VALUES (?, ?, ?, ?)',
          [clientId, userId, referralCode, phone || null]
        )
      }

      // If role is admin, create admin record
      if (role === 'admin') {
        const adminId = require('crypto').randomUUID()
        
        await connection.execute(
          'INSERT INTO admins (id, user_id) VALUES (?, ?)',
          [adminId, userId]
        )
      }

      await connection.commit()
      connection.release()

      res.status(201).json({ 
        message: 'Usuário criado com sucesso',
        user: { id: userId, name, email, role }
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Delete user (admin only)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const user = users[0]

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Você não pode excluir sua própria conta' })
    }

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Delete related records first (due to foreign key constraints)
      if (user.role === 'client') {
        // Get client ID
        const [clients] = await connection.execute(
          'SELECT id FROM clients WHERE user_id = ?',
          [id]
        )
        
        if (clients.length > 0) {
          const clientId = clients[0].id
          
          // Delete subscriptions
          await connection.execute(
            'DELETE FROM subscriptions WHERE client_id = ?',
            [clientId]
          )
          
          // Delete reward redemptions
          await connection.execute(
            'DELETE FROM reward_redemptions WHERE client_id = ?',
            [clientId]
          )
          
          // Delete referrals
          await connection.execute(
            'DELETE FROM referrals WHERE referrer_id = ? OR referred_id = ?',
            [clientId, clientId]
          )
          
          // Delete client record
          await connection.execute(
            'DELETE FROM clients WHERE id = ?',
            [clientId]
          )
        }
      }
      
      if (user.role === 'admin') {
        // Delete admin record
        await connection.execute(
          'DELETE FROM admins WHERE user_id = ?',
          [id]
        )
      }

      // Finally delete the user
      await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      )

      await connection.commit()
      connection.release()

      res.json({ message: 'Usuário excluído com sucesso' })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get all subscriptions (admin only)
app.get('/api/admin/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Simplificar a query para evitar problemas com parâmetros
    const [subscriptions] = await pool.execute(
      `SELECT s.*, u.name as client_name, u.email as client_email, 
              sp.name as plan_name, sp.price as plan_price,
              DATEDIFF(s.end_date, NOW()) as days_remaining
       FROM subscriptions s
       JOIN clients c ON s.client_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN subscription_plans sp ON s.plan_id = sp.id
       ORDER BY s.created_at DESC
       LIMIT 50`
    )

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM subscriptions`
    )

    // Mapear dados para o formato esperado pelo frontend
    const mappedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      user_name: sub.client_name,
      user_email: sub.client_email,
      plan_name: sub.plan_name,
      price: parseFloat(sub.plan_price || sub.price_paid || 0),
      status: sub.status,
      start_date: sub.start_date,
      end_date: sub.end_date,
      payment_method: sub.payment_method || 'N/A',
      auto_renewal: false, // Campo não existe na DB atual
      devices_used: 0, // Campo não existe na DB atual
      max_devices: 2 // Valor padrão
    }))

    res.json({
      subscriptions: mappedSubscriptions,
      pagination: {
        page: 1,
        limit: 50,
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / 50)
      }
    })
  } catch (error) {
    console.error('Admin subscriptions error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Create subscription (admin only)
app.post('/api/admin/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { client_id, plan_id, duration_days, price_paid, payment_method, notes } = req.body

    if (!client_id || !plan_id) {
      return res.status(400).json({ message: 'Client ID e Plan ID são obrigatórios' })
    }

    const subscriptionId = require('crypto').randomUUID()
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (duration_days || 30) * 24 * 60 * 60 * 1000)

    await pool.execute(
      `INSERT INTO subscriptions (id, client_id, plan_id, status, start_date, end_date, price_paid, payment_method, notes)
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)`,
      [subscriptionId, client_id, plan_id, startDate, endDate, price_paid, payment_method, notes]
    )

    // Update client subscription status
    await pool.execute(
      'UPDATE clients SET subscription_status = "active" WHERE id = ?',
      [client_id]
    )

    res.status(201).json({ message: 'Assinatura criada com sucesso', id: subscriptionId })
  } catch (error) {
    console.error('Create subscription error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update subscription status (admin only)
app.patch('/api/admin/subscriptions/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'active', 'expired', 'cancelled', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' })
    }

    await pool.execute(
      'UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    )

    res.json({ message: 'Status da assinatura atualizado com sucesso' })
  } catch (error) {
    console.error('Update subscription status error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ===== REWARDS MANAGEMENT =====

// Get all rewards (admin only)
app.get('/api/admin/rewards', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, type = '', active = '' } = req.query
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params = []

    if (type) {
      whereClause += ' AND reward_type = ?'
      params.push(type)
    }

    if (active !== '') {
      whereClause += ' AND is_active = ?'
      params.push(active === 'true')
    }

    const finalLimit = parseInt(limit);
    const finalOffset = parseInt(offset);
    
    const [rewards] = await pool.execute(
      `SELECT * FROM rewards ${whereClause} ORDER BY created_at DESC LIMIT ${finalLimit} OFFSET ${finalOffset}`
    )

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM rewards ${whereClause}`,
      params
    )

    // Mapear categorias do banco para o frontend
    const categoryMap = {
      'discount': 'discount',
      'free_month': 'product',
      'upgrade': 'service',
      'cashback': 'premium'
    }

    // Mapear dados para o formato esperado pelo frontend
    const mappedRewards = rewards.map(reward => ({
      id: reward.id,
      title: reward.name,
      description: reward.description,
      points_cost: reward.points_required,
      category: categoryMap[reward.reward_type] || 'discount',
      value: reward.reward_value,
      availability: reward.is_active ? 'available' : 'unavailable',
      stock: reward.max_redemptions,
      expires_at: reward.valid_until,
      terms: [], // Campo não existe na tabela, retornar array vazio
      created_at: reward.created_at,
      total_redeemed: reward.current_redemptions || 0,
      active: reward.is_active
    }))

    res.json({
      rewards: mappedRewards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / limit)
      }
    })
  } catch (error) {
    console.error('Admin rewards error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Create reward (admin only)
app.post('/api/admin/rewards', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, points_cost, category, value, stock, expires_at, terms, active } = req.body

    if (!title || !points_cost || !category) {
      return res.status(400).json({ message: 'Título, pontos necessários e categoria são obrigatórios' })
    }

    // Mapear categorias do frontend para o enum do banco
    const categoryMap = {
      'discount': 'discount',
      'product': 'free_month',
      'service': 'upgrade', 
      'premium': 'cashback'
    }
    
    const dbCategory = categoryMap[category] || 'discount'
    const rewardId = require('crypto').randomUUID()
    const expiresAt = expires_at ? new Date(expires_at) : null
    const stockValue = stock && stock !== '' ? parseInt(stock) : null
    const rewardValue = value && value !== '' ? parseFloat(value) : null

    await pool.execute(
      `INSERT INTO rewards (id, name, description, points_required, reward_type, reward_value, max_redemptions, valid_until, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rewardId, title, description, points_cost, dbCategory, rewardValue, stockValue, expiresAt, active !== false]
    )

    // Buscar a recompensa criada para retornar
    const [newReward] = await pool.execute(
      'SELECT * FROM rewards WHERE id = ?',
      [rewardId]
    )

    const reward = {
      id: newReward[0].id,
      title: newReward[0].name,
      description: newReward[0].description,
      points_cost: newReward[0].points_required,
      category: category, // Retornar a categoria original do frontend
      value: newReward[0].reward_value,
      availability: 'available',
      stock: newReward[0].max_redemptions,
      expires_at: newReward[0].valid_until,
      terms: terms || [],
      created_at: newReward[0].created_at,
      total_redeemed: newReward[0].current_redemptions || 0,
      active: newReward[0].is_active
    }

    res.status(201).json({ message: 'Recompensa criada com sucesso', reward })
  } catch (error) {
    console.error('Create reward error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update reward (admin only)
app.put('/api/admin/rewards/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, points_required, reward_type, reward_value, is_active, max_redemptions, valid_until } = req.body

    await pool.execute(
      `UPDATE rewards SET name = ?, description = ?, points_required = ?, reward_type = ?, 
       reward_value = ?, is_active = ?, max_redemptions = ?, valid_until = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, points_required, reward_type, reward_value, is_active, max_redemptions, valid_until, id]
    )

    res.json({ message: 'Recompensa atualizada com sucesso' })
  } catch (error) {
    console.error('Update reward error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Delete reward (admin only)
app.delete('/api/admin/rewards/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se a recompensa existe
    const [existingReward] = await pool.execute(
      'SELECT id FROM rewards WHERE id = ?',
      [id]
    )

    if (existingReward.length === 0) {
      return res.status(404).json({ message: 'Recompensa não encontrada' })
    }

    // Verificar se há resgates pendentes ou aprovados para esta recompensa
    const [activeRedemptions] = await pool.execute(
      'SELECT COUNT(*) as count FROM reward_redemptions WHERE reward_id = ? AND status IN ("pending", "approved")',
      [id]
    )

    if (activeRedemptions[0].count > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir esta recompensa pois há resgates pendentes ou aprovados' 
      })
    }

    // Excluir a recompensa
    await pool.execute(
      'DELETE FROM rewards WHERE id = ?',
      [id]
    )

    res.json({ message: 'Recompensa excluída com sucesso' })
  } catch (error) {
    console.error('Delete reward error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get reward redemptions (admin only) - rota alternativa
app.get('/api/admin/rewards/redemptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params = []

    if (status) {
      whereClause += ' AND rr.status = ?'
      params.push(status)
    }

    const finalLimit = parseInt(limit);
    const finalOffset = parseInt(offset);
    
    const [redemptions] = await pool.execute(
      `SELECT rr.*, u.name as client_name, u.email as client_email, r.name as reward_title
       FROM reward_redemptions rr
       JOIN clients c ON rr.client_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN rewards r ON rr.reward_id = r.id
       ${whereClause}
       ORDER BY rr.redeemed_at DESC
       LIMIT ${finalLimit} OFFSET ${finalOffset}`
    )

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM reward_redemptions rr
       JOIN clients c ON rr.client_id = c.id
       ${whereClause}`,
      params
    )

    res.json({
      redemptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / limit)
      }
    })
  } catch (error) {
    console.error('Admin rewards redemptions error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get reward redemptions (admin only)
app.get('/api/admin/reward-redemptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params = []

    if (status) {
      whereClause += ' AND rr.status = ?'
      params.push(status)
    }

    const finalLimit = parseInt(limit);
    const finalOffset = parseInt(offset);
    
    const [redemptions] = await pool.execute(
      `SELECT rr.*, u.name as client_name, u.email as client_email, r.name as reward_name
       FROM reward_redemptions rr
       JOIN clients c ON rr.client_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN rewards r ON rr.reward_id = r.id
       ${whereClause}
       ORDER BY rr.redeemed_at DESC
       LIMIT ${finalLimit} OFFSET ${finalOffset}`
    )

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM reward_redemptions rr
       JOIN clients c ON rr.client_id = c.id
       ${whereClause}`,
      params
    )

    res.json({
      redemptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / limit)
      }
    })
  } catch (error) {
    console.error('Admin reward redemptions error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update redemption status (admin only)
app.patch('/api/admin/reward-redemptions/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'approved', 'used', 'expired', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' })
    }

    await pool.execute(
      'UPDATE reward_redemptions SET status = ? WHERE id = ?',
      [status, id]
    )

    res.json({ message: 'Status do resgate atualizado com sucesso' })
  } catch (error) {
    console.error('Update redemption status error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ===== REFERRALS MANAGEMENT =====

// Get all referrals (admin only)
app.get('/api/admin/referrals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params = []

    if (status) {
      whereClause += ' AND r.status = ?'
      params.push(status)
    }

    const finalLimit = parseInt(limit);
    const finalOffset = parseInt(offset);
    
    const [referrals] = await pool.execute(
      `SELECT r.*, 
              u1.name as referrer_name, u1.email as referrer_email,
              u2.name as referred_name, u2.email as referred_email
       FROM referrals r
       JOIN clients c1 ON r.referrer_id = c1.id
       JOIN users u1 ON c1.user_id = u1.id
       JOIN clients c2 ON r.referred_id = c2.id
       JOIN users u2 ON c2.user_id = u2.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ${finalLimit} OFFSET ${finalOffset}`
    )

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM referrals r ${whereClause}`,
      params
    )

    res.json({
      referrals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / limit)
      }
    })
  } catch (error) {
    console.error('Admin referrals error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update referral status (admin only)
app.patch('/api/admin/referrals/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status, reward_points } = req.body

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Update referral status
      await connection.execute(
        'UPDATE referrals SET status = ?, reward_points = ?, reward_given = ? WHERE id = ?',
        [status, reward_points || 0, status === 'completed', id]
      )

      // If completed, add points to referrer
      if (status === 'completed' && reward_points > 0) {
        const [referral] = await connection.execute(
          'SELECT referrer_id FROM referrals WHERE id = ?',
          [id]
        )

        if (referral.length > 0) {
          await connection.execute(
            'UPDATE clients SET total_points = total_points + ? WHERE id = ?',
            [reward_points, referral[0].referrer_id]
          )
        }
      }

      await connection.commit()
      connection.release()

      res.json({ message: 'Status da indicação atualizado com sucesso' })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Update referral status error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Approve referral (admin only)
app.post('/api/admin/referrals/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Get referral details
      const [referrals] = await connection.execute(
        'SELECT * FROM referrals WHERE id = ? AND status = "pending"',
        [id]
      )

      if (referrals.length === 0) {
        await connection.rollback()
        connection.release()
        return res.status(404).json({ message: 'Indicação não encontrada ou já processada' })
      }

      const referral = referrals[0]
      const rewardPoints = 100 // Pontos padrão por indicação aprovada

      // Update referral status to completed
      await connection.execute(
        'UPDATE referrals SET status = "completed", reward_points = ?, reward_given = true, completed_at = NOW() WHERE id = ?',
        [rewardPoints, id]
      )

      // Add points to referrer
      await connection.execute(
        'UPDATE clients SET total_points = total_points + ? WHERE id = ?',
        [rewardPoints, referral.referrer_id]
      )

      // Add point transaction record
      await connection.execute(
        'INSERT INTO point_transactions (client_id, type, points, description, reference_type, reference_id) VALUES (?, "earned", ?, "Indicação aprovada", "referral", ?)',
        [referral.referrer_id, rewardPoints, id]
      )

      await connection.commit()
      connection.release()

      res.json({ message: 'Indicação aprovada com sucesso' })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Approve referral error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Cancel referral (admin only)
app.post('/api/admin/referrals/:id/cancel', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Get referral details
      const [referrals] = await connection.execute(
        'SELECT * FROM referrals WHERE id = ? AND status = "pending"',
        [id]
      )

      if (referrals.length === 0) {
        await connection.rollback()
        connection.release()
        return res.status(404).json({ message: 'Indicação não encontrada ou já processada' })
      }

      // Update referral status to cancelled
      await connection.execute(
        'UPDATE referrals SET status = "cancelled", completed_at = NOW() WHERE id = ?',
        [id]
      )

      await connection.commit()
      connection.release()

      res.json({ message: 'Indicação cancelada com sucesso' })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Cancel referral error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get referrals stats (admin only)
app.get('/api/admin/referrals/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total referrals count
    const [totalReferrals] = await pool.execute(
      'SELECT COUNT(*) as total FROM referrals'
    )

    // Get completed referrals count
    const [completedReferrals] = await pool.execute(
      'SELECT COUNT(*) as completed FROM referrals WHERE status = "completed"'
    )

    // Get pending referrals count
    const [pendingReferrals] = await pool.execute(
      'SELECT COUNT(*) as pending FROM referrals WHERE status = "pending"'
    )

    // Get cancelled referrals count
    const [cancelledReferrals] = await pool.execute(
      'SELECT COUNT(*) as cancelled FROM referrals WHERE status = "cancelled"'
    )

    // Get total points awarded
    const [totalPoints] = await pool.execute(
      'SELECT COALESCE(SUM(reward_points), 0) as total_points FROM referrals WHERE status = "completed"'
    )

    // Get top referrer
    const [topReferrer] = await pool.execute(
      `SELECT u.name, COUNT(r.id) as referrals, COALESCE(SUM(r.reward_points), 0) as points
       FROM referrals r
       JOIN clients c ON r.referrer_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE r.status = "completed"
       GROUP BY r.referrer_id, u.name
       ORDER BY referrals DESC, points DESC
       LIMIT 1`
    )

    // Calculate conversion rate
    const total = totalReferrals[0].total
    const completed = completedReferrals[0].completed
    const conversionRate = total > 0 ? (completed / total) * 100 : 0

    // Calculate monthly growth (comparing this month to last month)
    const [thisMonth] = await pool.execute(
      'SELECT COUNT(*) as count FROM referrals WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())'
    )

    const [lastMonth] = await pool.execute(
      'SELECT COUNT(*) as count FROM referrals WHERE MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))'
    )

    const monthlyGrowth = lastMonth[0].count > 0 ? 
      ((thisMonth[0].count - lastMonth[0].count) / lastMonth[0].count) * 100 : 
      (thisMonth[0].count > 0 ? 100 : 0)

    const stats = {
      total_referrals: total,
      completed_referrals: completed,
      pending_referrals: pendingReferrals[0].pending,
      cancelled_referrals: cancelledReferrals[0].cancelled,
      total_points_awarded: totalPoints[0].total_points,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      top_referrer: topReferrer.length > 0 ? {
        name: topReferrer[0].name,
        referrals: topReferrer[0].referrals,
        points: topReferrer[0].points
      } : {
        name: 'Nenhum',
        referrals: 0,
        points: 0
      },
      monthly_growth: Math.round(monthlyGrowth * 100) / 100
    }

    res.json(stats)
  } catch (error) {
    console.error('Referrals stats error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get top referrers (admin only)
app.get('/api/admin/referrals/top-referrers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const limitValue = Math.max(1, Math.min(100, parseInt(limit))) // Sanitize limit

    const [topReferrers] = await pool.execute(
      `SELECT 
         c.id,
         u.name,
         u.email,
         COUNT(r.id) as total_referrals,
         COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_referrals,
         COALESCE(SUM(CASE WHEN r.status = 'completed' THEN r.reward_points ELSE 0 END), 0) as total_points,
         CASE 
           WHEN COUNT(r.id) > 0 THEN ROUND((COUNT(CASE WHEN r.status = 'completed' THEN 1 END) / COUNT(r.id)) * 100, 2)
           ELSE 0 
         END as conversion_rate,
         MAX(r.created_at) as last_referral
       FROM clients c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN referrals r ON c.id = r.referrer_id
       GROUP BY c.id, u.name, u.email
       HAVING total_referrals > 0
       ORDER BY completed_referrals DESC, total_referrals DESC
       LIMIT ${limitValue}`
    )

    res.json(topReferrers)
  } catch (error) {
    console.error('Top referrers error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ===== REPORTS =====

// Get admin reports
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query
    const days = parseInt(period)

    // Revenue stats
    const [revenueStats] = await pool.execute(
      `SELECT 
         COALESCE(SUM(amount_paid), 0) as total_revenue,
         COALESCE(SUM(CASE WHEN payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount_paid END), 0) as monthly_revenue,
         COUNT(CASE WHEN payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as monthly_transactions
       FROM payments 
       WHERE status = 'completed'`
    )

    // User stats
    const [userStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month,
         COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users
       FROM users 
       WHERE role = 'client'`
    )

    // Subscription stats
    const [subscriptionStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
         COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month,
         ROUND((COUNT(CASE WHEN status = 'cancelled' THEN 1 END) / COUNT(*)) * 100, 2) as churn_rate
       FROM subscriptions`
    )

    // Top plans
    const [topPlans] = await pool.execute(
      `SELECT 
         sp.name, 
         COUNT(s.id) as subscribers, 
         COALESCE(SUM(s.price_paid), 0) as revenue,
         ROUND((COUNT(s.id) / (SELECT COUNT(*) FROM subscriptions)) * 100, 2) as percentage
       FROM subscription_plans sp
       LEFT JOIN subscriptions s ON sp.id = s.plan_id
       GROUP BY sp.id, sp.name
       ORDER BY subscribers DESC
       LIMIT 5`
    )

    // Monthly revenue data
    const [monthlyRevenue] = await pool.execute(
      `SELECT 
         DATE_FORMAT(payment_date, '%Y-%m') as month,
         COALESCE(SUM(amount_paid), 0) as revenue,
         COUNT(*) as subscriptions
       FROM payments 
       WHERE status = 'completed' AND payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`
    )

    // Calculate growth percentage
    const currentRevenue = revenueStats[0]?.monthly_revenue || 0
    const [previousRevenue] = await pool.execute(
      `SELECT COALESCE(SUM(amount_paid), 0) as prev_revenue
       FROM payments 
       WHERE status = 'completed' 
       AND payment_date >= DATE_SUB(NOW(), INTERVAL 60 DAY)
       AND payment_date < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    )
    
    const prevRevenue = previousRevenue[0]?.prev_revenue || 0
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0

    const reportData = {
      revenue: {
        total: revenueStats[0]?.total_revenue || 0,
        monthly: revenueStats[0]?.monthly_revenue || 0,
        growth: Math.round(revenueGrowth * 100) / 100
      },
      subscriptions: {
        total: subscriptionStats[0]?.total || 0,
        active: subscriptionStats[0]?.active || 0,
        new_this_month: subscriptionStats[0]?.new_this_month || 0,
        churn_rate: subscriptionStats[0]?.churn_rate || 0
      },
      users: {
        total: userStats[0]?.total_users || 0,
        new_this_month: userStats[0]?.new_this_month || 0,
        active_users: userStats[0]?.active_users || 0
      },
      plans: topPlans.map(plan => ({
        name: plan.name,
        subscribers: plan.subscribers,
        revenue: plan.revenue,
        percentage: plan.percentage
      })),
      monthly_revenue: monthlyRevenue.map(item => ({
        month: item.month,
        revenue: item.revenue,
        subscriptions: item.subscriptions
      }))
    }

    // Add expenses data to report
    const [expensesData] = await pool.execute(
      `SELECT 
         id, description, amount, category, date, type, notes,
         created_at, updated_at
       FROM expenses 
       WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY date DESC`,
      [days]
    )

    reportData.expenses = expensesData

    res.json({ reportData })
  } catch (error) {
    console.error('Reports error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ===== EXPENSES ROUTES =====

// Get all expenses (admin only)
app.get('/api/admin/expenses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30', category, type } = req.query
    const days = parseInt(period)
    
    let query = `
      SELECT 
        id, description, amount, category, date, type, notes,
        created_at, updated_at
      FROM expenses 
      WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `
    const params = [days]
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }
    
    query += ' ORDER BY date DESC'
    
    const [expenses] = await pool.execute(query, params)
    
    res.json({ expenses })
  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Create new expense (admin only)
app.post('/api/admin/expenses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { description, amount, category, date, type, notes } = req.body
    
    if (!description || !amount || !category || !date || !type) {
      return res.status(400).json({ message: 'Campos obrigatórios: description, amount, category, date, type' })
    }
    
    if (!['fixed', 'variable'].includes(type)) {
      return res.status(400).json({ message: 'Tipo deve ser "fixed" ou "variable"' })
    }
    
    const expenseId = require('crypto').randomUUID()
    
    // Convert date to MySQL DATE format (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split('T')[0]
    
    await pool.execute(
      `INSERT INTO expenses (id, description, amount, category, date, type, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [expenseId, description, parseFloat(amount), category, formattedDate, type, notes || null, req.user.userId]
    )
    
    const [newExpense] = await pool.execute(
      'SELECT * FROM expenses WHERE id = ?',
      [expenseId]
    )
    
    res.status(201).json({ 
      message: 'Despesa criada com sucesso',
      expense: newExpense[0]
    })
  } catch (error) {
    console.error('Create expense error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update expense (admin only)
app.put('/api/admin/expenses/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { description, amount, category, date, type, notes } = req.body
    
    if (!description || !amount || !category || !date || !type) {
      return res.status(400).json({ message: 'Campos obrigatórios: description, amount, category, date, type' })
    }
    
    if (!['fixed', 'variable'].includes(type)) {
      return res.status(400).json({ message: 'Tipo deve ser "fixed" ou "variable"' })
    }
    
    // Convert date to MySQL DATE format (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split('T')[0]
    
    const [result] = await pool.execute(
      `UPDATE expenses 
       SET description = ?, amount = ?, category = ?, date = ?, type = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [description, parseFloat(amount), category, formattedDate, type, notes || null, id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Despesa não encontrada' })
    }
    
    const [updatedExpense] = await pool.execute(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    )
    
    res.json({ 
      message: 'Despesa atualizada com sucesso',
      expense: updatedExpense[0]
    })
  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Delete expense (admin only)
app.delete('/api/admin/expenses/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const [result] = await pool.execute(
      'DELETE FROM expenses WHERE id = ?',
      [id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Despesa não encontrada' })
    }
    
    res.json({ message: 'Despesa excluída com sucesso' })
  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get expense categories (admin only)
app.get('/api/admin/expenses/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT DISTINCT category, COUNT(*) as count
       FROM expenses 
       GROUP BY category 
       ORDER BY count DESC, category ASC`
    )
    
    res.json({ categories })
  } catch (error) {
    console.error('Get expense categories error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get expense statistics (admin only)
app.get('/api/admin/expenses/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query
    const days = parseInt(period)
    
    // Total expenses
    const [totalStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_count,
         COALESCE(SUM(amount), 0) as total_amount,
         COALESCE(SUM(CASE WHEN type = 'fixed' THEN amount END), 0) as fixed_amount,
         COALESCE(SUM(CASE WHEN type = 'variable' THEN amount END), 0) as variable_amount,
         COUNT(CASE WHEN type = 'fixed' THEN 1 END) as fixed_count,
         COUNT(CASE WHEN type = 'variable' THEN 1 END) as variable_count
       FROM expenses 
       WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    )
    
    // Expenses by category
    const [categoryStats] = await pool.execute(
      `SELECT 
         category,
         COUNT(*) as count,
         COALESCE(SUM(amount), 0) as total_amount,
         ROUND((SUM(amount) / (SELECT SUM(amount) FROM expenses WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY))) * 100, 2) as percentage
       FROM expenses 
       WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY category 
       ORDER BY total_amount DESC`,
      [days, days]
    )
    
    // Monthly expenses trend
    const [monthlyTrend] = await pool.execute(
      `SELECT 
         DATE_FORMAT(date, '%Y-%m') as month,
         COUNT(*) as count,
         COALESCE(SUM(amount), 0) as total_amount,
         COALESCE(SUM(CASE WHEN type = 'fixed' THEN amount END), 0) as fixed_amount,
         COALESCE(SUM(CASE WHEN type = 'variable' THEN amount END), 0) as variable_amount
       FROM expenses 
       WHERE date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`
    )
    
    res.json({
      total: totalStats[0],
      by_category: categoryStats,
      monthly_trend: monthlyTrend
    })
  } catch (error) {
    console.error('Get expense stats error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ===== SYSTEM SETTINGS =====

// Get system settings (admin only)
app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM system_settings ORDER BY `key`'
    )

    const settingsObj = {}
    settings.forEach(setting => {
      let value = setting.value
      if (setting.type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = {}
        }
      } else if (setting.type === 'boolean') {
        value = value === 'true'
      } else if (setting.type === 'number') {
        value = parseFloat(value)
      }
      settingsObj[setting.key] = value
    })

    // Structure settings according to frontend expectations
    const structuredSettings = {
      general: {
        site_name: settingsObj.app_name || 'IPTV Manager',
        site_description: settingsObj.site_description || 'Plataforma de gerenciamento IPTV',
        contact_email: settingsObj.contact_email || 'contato@iptv.com',
        support_phone: settingsObj.support_phone || '(11) 99999-9999',
        timezone: settingsObj.timezone || 'America/Sao_Paulo',
        language: settingsObj.language || 'pt-BR',
        logo_url: settingsObj.logo_url || ''
      },
      subscription: {
        trial_days: settingsObj.trial_days || 7,
        max_devices: settingsObj.max_devices_per_plan || 5,
        auto_renewal: settingsObj.auto_renewal || true,
        grace_period_days: settingsObj.grace_period_days || 3
      },
      payment: {
        currency: settingsObj.currency || 'BRL',
        tax_rate: settingsObj.tax_rate || 0,
        payment_methods: settingsObj.payment_methods || ['credit_card', 'pix'],
        webhook_url: settingsObj.webhook_url || ''
      },
      notifications: {
        email_enabled: settingsObj.email_enabled || true,
        sms_enabled: settingsObj.sms_enabled || false,
        push_enabled: settingsObj.push_enabled || true,
        admin_notifications: settingsObj.admin_notifications || true
      },
      security: {
        password_min_length: settingsObj.password_min_length || 8,
        require_2fa: settingsObj.require_2fa || false,
        session_timeout: settingsObj.session_timeout || 3600,
        max_login_attempts: settingsObj.max_login_attempts || 5
      },
      plans: {
        monthly_price: settingsObj.monthly_price || 29.90,
        quarterly_price: settingsObj.quarterly_price || 79.90,
        quarterly_discount: settingsObj.quarterly_discount || 10,
        semiannual_price: settingsObj.semiannual_price || 149.90,
        semiannual_discount: settingsObj.semiannual_discount || 15,
        annual_price: settingsObj.annual_price || 299.90,
        annual_discount: settingsObj.annual_discount || 20
      },
      downloads: {
        android_app_url: settingsObj.android_app_url || '',
        ios_app_url: settingsObj.ios_app_url || '',
        windows_app_url: settingsObj.windows_app_url || '',
        mac_app_url: settingsObj.mac_app_url || '',
        smart_tv_guide_url: settingsObj.smart_tv_guide_url || ''
      },
      branding: {
        primary_color: settingsObj.primary_color || '#3B82F6',
        secondary_color: settingsObj.secondary_color || '#8B5CF6',
        footer_text: settingsObj.footer_text || '© 2024 IPTV Manager. Todos os direitos reservados.',
        social_facebook: settingsObj.social_facebook || '',
        social_instagram: settingsObj.social_instagram || '',
        social_twitter: settingsObj.social_twitter || '',
        social_youtube: settingsObj.social_youtube || ''
      }
    }

    res.json({ settings: structuredSettings })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update system settings (admin only)
app.put('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Flatten the nested settings structure
      const flatSettings = {
        // General settings
        app_name: settings.general?.site_name,
        site_description: settings.general?.site_description,
        contact_email: settings.general?.contact_email,
        support_phone: settings.general?.support_phone,
        timezone: settings.general?.timezone,
        language: settings.general?.language,
        logo_url: settings.general?.logo_url,
        
        // Subscription settings
        trial_days: settings.subscription?.trial_days,
        max_devices_per_plan: settings.subscription?.max_devices,
        auto_renewal: settings.subscription?.auto_renewal,
        grace_period_days: settings.subscription?.grace_period_days,
        
        // Payment settings
        currency: settings.payment?.currency,
        tax_rate: settings.payment?.tax_rate,
        payment_methods: settings.payment?.payment_methods,
        webhook_url: settings.payment?.webhook_url,
        
        // Notification settings
        email_enabled: settings.notifications?.email_enabled,
        sms_enabled: settings.notifications?.sms_enabled,
        push_enabled: settings.notifications?.push_enabled,
        admin_notifications: settings.notifications?.admin_notifications,
        
        // Security settings
        password_min_length: settings.security?.password_min_length,
        require_2fa: settings.security?.require_2fa,
        session_timeout: settings.security?.session_timeout,
        max_login_attempts: settings.security?.max_login_attempts,
        
        // Plans settings
        monthly_price: settings.plans?.monthly_price,
        quarterly_price: settings.plans?.quarterly_price,
        quarterly_discount: settings.plans?.quarterly_discount,
        semiannual_price: settings.plans?.semiannual_price,
        semiannual_discount: settings.plans?.semiannual_discount,
        annual_price: settings.plans?.annual_price,
        annual_discount: settings.plans?.annual_discount,
        
        // Downloads settings
        android_app_url: settings.downloads?.android_app_url,
        ios_app_url: settings.downloads?.ios_app_url,
        windows_app_url: settings.downloads?.windows_app_url,
        mac_app_url: settings.downloads?.mac_app_url,
        smart_tv_guide_url: settings.downloads?.smart_tv_guide_url,
        
        // Branding settings
        primary_color: settings.branding?.primary_color,
        secondary_color: settings.branding?.secondary_color,
        footer_text: settings.branding?.footer_text,
        social_facebook: settings.branding?.social_facebook,
        social_instagram: settings.branding?.social_instagram,
        social_twitter: settings.branding?.social_twitter,
        social_youtube: settings.branding?.social_youtube
      }

      for (const [key, value] of Object.entries(flatSettings)) {
        if (value === undefined) continue
        
        let stringValue = value
        let type = 'string'

        if (typeof value === 'boolean') {
          stringValue = value.toString()
          type = 'boolean'
        } else if (typeof value === 'number') {
          stringValue = value.toString()
          type = 'number'
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value)
          type = 'json'
        }

        await connection.execute(
          `INSERT INTO system_settings (id, \`key\`, value, type) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE value = ?, type = ?, updated_at = CURRENT_TIMESTAMP`,
          [require('crypto').randomUUID(), key, stringValue, type, stringValue, type]
        )
      }

      await connection.commit()
      connection.release()

      res.json({ message: 'Configurações atualizadas com sucesso' })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ===== CLIENT ROUTES =====

// Get client rewards
app.get('/api/client/rewards', authenticateToken, async (req, res) => {
  try {
    const [client] = await pool.execute(
      'SELECT id, total_points FROM clients WHERE user_id = ?',
      [req.user.userId]
    )

    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' })
    }

    const clientId = client[0].id
    const totalPoints = client[0].total_points

    // Get available rewards
    const [rewards] = await pool.execute(
      `SELECT * FROM rewards 
       WHERE is_active = 1 AND (valid_until IS NULL OR valid_until > NOW())
       AND (max_redemptions IS NULL OR current_redemptions < max_redemptions)
       ORDER BY points_required ASC`
    )

    // Format rewards for frontend
    const formattedRewards = rewards.map(reward => ({
      id: reward.id,
      title: reward.name,
      name: reward.name,
      description: reward.description || 'Recompensa disponível',
      points_cost: reward.points_required,
      points_required: reward.points_required,
      category: 'product', // Default category
      value: `${reward.points_required} pontos`,
      availability: 'available',
      is_active: reward.is_active,
      max_redemptions: reward.max_redemptions,
      current_redemptions: reward.current_redemptions || 0,
      valid_until: reward.valid_until,
      created_at: reward.created_at
    }))

    // Get client redemptions
    const [redemptions] = await pool.execute(
      `SELECT rr.*, r.name as reward_name, r.description as reward_description
       FROM reward_redemptions rr
       JOIN rewards r ON rr.reward_id = r.id
       WHERE rr.client_id = ?
       ORDER BY rr.redeemed_at DESC`,
      [clientId]
    )

    res.json({
      rewards: formattedRewards,
      redemptions: redemptions
    })
  } catch (error) {
    console.error('Client rewards error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Redeem reward
app.post('/api/client/rewards/:id/redeem', authenticateToken, async (req, res) => {
  try {
    const { id: rewardId } = req.params

    const [client] = await pool.execute(
      'SELECT id, total_points FROM clients WHERE user_id = ?',
      [req.user.userId]
    )

    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' })
    }

    const clientId = client[0].id
    const totalPoints = client[0].total_points

    // Get reward details
    const [reward] = await pool.execute(
      'SELECT * FROM rewards WHERE id = ? AND is_active = 1',
      [rewardId]
    )

    if (reward.length === 0) {
      return res.status(404).json({ message: 'Recompensa não encontrada' })
    }

    const rewardData = reward[0]

    // Check if client has enough points
    if (totalPoints < rewardData.points_required) {
      return res.status(400).json({ message: 'Pontos insuficientes' })
    }

    // Check redemption limits
    if (rewardData.max_redemptions && rewardData.current_redemptions >= rewardData.max_redemptions) {
      return res.status(400).json({ message: 'Limite de resgates atingido' })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Create redemption
      const redemptionId = require('crypto').randomUUID()
      await connection.execute(
        `INSERT INTO reward_redemptions (id, client_id, reward_id, points_used, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [redemptionId, clientId, rewardId, rewardData.points_required]
      )

      // Deduct points from client
      await connection.execute(
        'UPDATE clients SET total_points = total_points - ? WHERE id = ?',
        [rewardData.points_required, clientId]
      )

      // Update reward redemption count
      await connection.execute(
        'UPDATE rewards SET current_redemptions = current_redemptions + 1 WHERE id = ?',
        [rewardId]
      )

      await connection.commit()
      connection.release()

      res.status(201).json({ message: 'Recompensa resgatada com sucesso', id: redemptionId })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Redeem reward error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get client redeemed rewards
app.get('/api/client/rewards/redeemed', authenticateToken, async (req, res) => {
  try {
    const [client] = await pool.execute(
      'SELECT id FROM clients WHERE user_id = ?',
      [req.user.userId]
    )

    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' })
    }

    const clientId = client[0].id

    // Get client redemptions
    const [redemptions] = await pool.execute(
      `SELECT rr.*, r.name as reward_title, r.description as reward_description,
              r.points_required as points_spent, rr.created_at as redeemed_at
       FROM reward_redemptions rr
       JOIN rewards r ON rr.reward_id = r.id
       WHERE rr.client_id = ?
       ORDER BY rr.created_at DESC`,
      [clientId]
    )

    // Format redemptions data
    const formattedRedemptions = redemptions.map(redemption => ({
      id: redemption.id,
      reward_title: redemption.reward_title,
      points_spent: redemption.points_spent,
      redeemed_at: redemption.redeemed_at,
      status: redemption.status || 'active',
      code: redemption.code || null,
      expires_at: redemption.expires_at || null
    }))

    res.json({
      redeemed_rewards: formattedRedemptions
    })
  } catch (error) {
    console.error('Client redeemed rewards error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get client referrals
app.get('/api/client/referrals', authenticateToken, async (req, res) => {
  try {
    const [client] = await pool.execute(
      'SELECT id, referral_code, total_referrals FROM clients WHERE user_id = ?',
      [req.user.userId]
    )

    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' })
    }

    const clientId = client[0].id
    const referralCode = client[0].referral_code

    // Get referrals made by this client
    const [referrals] = await pool.execute(
      `SELECT r.*, u.name as referred_name, u.email as referred_email, r.created_at as referred_at
       FROM referrals r
       JOIN clients c ON r.referred_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE r.referrer_id = ?
       ORDER BY r.created_at DESC`,
      [clientId]
    )

    // Get referral statistics
    const [pendingCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ? AND status = "pending"',
      [clientId]
    )

    const [completedCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ? AND status = "completed"',
      [clientId]
    )

    // Get total points earned from referrals
    const [pointsEarned] = await pool.execute(
      'SELECT COALESCE(SUM(points), 0) as total FROM point_transactions WHERE client_id = ? AND description LIKE "%indicação%"',
      [clientId]
    )

    // Get points earned this month
    const [pointsThisMonth] = await pool.execute(
      'SELECT COALESCE(SUM(points), 0) as total FROM point_transactions WHERE client_id = ? AND description LIKE "%indicação%" AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())',
      [clientId]
    )

    const referralData = {
      referral_code: referralCode,
      total_referrals: client[0].total_referrals || 0,
      pending_referrals: pendingCount[0].count || 0,
      completed_referrals: completedCount[0].count || 0,
      total_points_earned: pointsEarned[0].total || 0,
      points_this_month: pointsThisMonth[0].total || 0,
      referral_link: `http://localhost:3000/register?ref=${referralCode}`
    }

    // Format referrals data
    const formattedReferrals = referrals.map(referral => ({
      id: referral.id,
      referred_name: referral.referred_name,
      referred_email: referral.referred_email,
      status: referral.status,
      points_earned: 100, // Default points per referral
      referred_at: referral.referred_at,
      completed_at: referral.completed_at
    }))

    // Mock referral rewards data
    const referralRewards = [
      {
        id: '1',
        title: 'Primeira Indicação',
        description: 'Ganhe 100 pontos pela sua primeira indicação',
        points_required: 0,
        referrals_required: 1,
        reward_type: 'points',
        reward_value: '100 pontos',
        claimed: completedCount[0].count >= 1
      },
      {
        id: '2',
        title: 'Indicador Bronze',
        description: 'Ganhe 500 pontos por 5 indicações',
        points_required: 0,
        referrals_required: 5,
        reward_type: 'points',
        reward_value: '500 pontos',
        claimed: completedCount[0].count >= 5
      },
      {
        id: '3',
        title: 'Indicador Prata',
        description: 'Ganhe 1 mês grátis por 10 indicações',
        points_required: 0,
        referrals_required: 10,
        reward_type: 'premium',
        reward_value: '1 mês grátis',
        claimed: completedCount[0].count >= 10
      }
    ]

    res.json({
      referralData,
      referrals: formattedReferrals,
      referralRewards
    })
  } catch (error) {
    console.error('Client referrals error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Create referral
app.post('/api/client/referrals', authenticateToken, async (req, res) => {
  try {
    const { referral_code } = req.body

    if (!referral_code) {
      return res.status(400).json({ message: 'Código de indicação é obrigatório' })
    }

    const [client] = await pool.execute(
      'SELECT id FROM clients WHERE user_id = ?',
      [req.user.userId]
    )

    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' })
    }

    const referredId = client[0].id

    // Find referrer by code
    const [referrer] = await pool.execute(
      'SELECT id FROM clients WHERE referral_code = ? AND id != ?',
      [referral_code, referredId]
    )

    if (referrer.length === 0) {
      return res.status(404).json({ message: 'Código de indicação inválido' })
    }

    const referrerId = referrer[0].id

    // Check if referral already exists
    const [existingReferral] = await pool.execute(
      'SELECT id FROM referrals WHERE referrer_id = ? AND referred_id = ?',
      [referrerId, referredId]
    )

    if (existingReferral.length > 0) {
      return res.status(400).json({ message: 'Indicação já existe' })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Create referral
      const referralId = require('crypto').randomUUID()
      await connection.execute(
        'INSERT INTO referrals (id, referrer_id, referred_id, status) VALUES (?, ?, ?, "pending")',
        [referralId, referrerId, referredId]
      )

      // Update referrer's total referrals
      await connection.execute(
        'UPDATE clients SET total_referrals = total_referrals + 1 WHERE id = ?',
        [referrerId]
      )

      // Update referred client's referred_by
      await connection.execute(
        'UPDATE clients SET referred_by = ? WHERE id = ?',
        [referrerId, referredId]
      )

      await connection.commit()
      connection.release()

      res.status(201).json({ message: 'Indicação criada com sucesso', id: referralId })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Create referral error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get client points
app.get('/api/client/points', authenticateToken, async (req, res) => {
  try {
    const [client] = await pool.execute(
      'SELECT id, referral_code FROM clients WHERE user_id = ?',
      [req.user.userId]
    )

    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' })
    }

    const clientId = client[0].id
    const referralCode = client[0].referral_code

    // Get current points
    const [pointsResult] = await pool.execute(
      'SELECT COALESCE(SUM(points), 0) as current_points FROM point_transactions WHERE client_id = ?',
      [clientId]
    )

    // Get total earned points
    const [earnedResult] = await pool.execute(
      'SELECT COALESCE(SUM(points), 0) as total_earned FROM point_transactions WHERE client_id = ? AND points > 0',
      [clientId]
    )

    // Get points this month
    const [monthResult] = await pool.execute(
      'SELECT COALESCE(SUM(points), 0) as points_this_month FROM point_transactions WHERE client_id = ? AND points > 0 AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())',
      [clientId]
    )

    // Get referrals count
    const [referralsResult] = await pool.execute(
      'SELECT COUNT(*) as referrals_count FROM referrals WHERE referrer_id = ? AND status = "completed"',
      [clientId]
    )

    // Get points history
    const [history] = await pool.execute(
      'SELECT * FROM point_transactions WHERE client_id = ? ORDER BY created_at DESC LIMIT 20',
      [clientId]
    )

    const currentPoints = pointsResult[0].current_points
    let level = { current: 1, name: 'Bronze', min_points: 0, max_points: 500 }
    
    if (currentPoints >= 5000) {
      level = { current: 5, name: 'Diamante', min_points: 5000, max_points: null }
    } else if (currentPoints >= 2000) {
      level = { current: 4, name: 'Platina', min_points: 2000, max_points: 5000 }
    } else if (currentPoints >= 1000) {
      level = { current: 3, name: 'Ouro', min_points: 1000, max_points: 2000 }
    } else if (currentPoints >= 500) {
      level = { current: 2, name: 'Prata', min_points: 500, max_points: 1000 }
    }

    const pointsData = {
      current_points: currentPoints,
      total_earned: earnedResult[0].total_earned,
      points_this_month: monthResult[0].points_this_month,
      referrals_count: referralsResult[0].referrals_count,
      referral_code: referralCode,
      level
    }

    res.json({ pointsData, history })
  } catch (error) {
    console.error('Client points error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update client profile
app.put('/api/client/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, birth_date, address } = req.body

    // Validate and sanitize parameters
    const sanitizedName = name || null
    const sanitizedPhone = phone || null
    const sanitizedAddress = address ? JSON.stringify(address) : null

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Update user table
      await connection.execute(
        'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [sanitizedName, req.user.userId]
      )

      // Update client table
      await connection.execute(
        'UPDATE clients SET phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [sanitizedPhone, sanitizedAddress, req.user.userId]
      )

      await connection.commit()
      connection.release()

      res.json({ message: 'Perfil atualizado com sucesso' })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get client subscriptions
app.get('/api/client/subscriptions', authenticateToken, async (req, res) => {
  try {
    const [client] = await pool.execute(
      'SELECT id FROM clients WHERE user_id = ?',
      [req.user.userId]
    )

    if (client.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' })
    }

    const clientId = client[0].id

    const [subscriptions] = await pool.execute(
      `SELECT s.*, sp.name as plan_name, sp.description as plan_description, 
              sp.max_devices, sp.features,
              DATEDIFF(s.end_date, NOW()) as days_remaining
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.client_id = ?
       ORDER BY s.created_at DESC`,
      [clientId]
    )

    res.json({ subscriptions })
  } catch (error) {
    console.error('Client subscriptions error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Get client notifications
app.get('/api/client/notifications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, unread_only = false } = req.query
    const offset = (page - 1) * limit

    let whereClause = 'WHERE user_id = ?'
    const params = [req.user.userId]

    if (unread_only === 'true') {
      whereClause += ' AND is_read = FALSE'
    }

    const [notifications] = await pool.execute(
      `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    const [totalCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    )

    const [unreadCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.userId]
    )

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / limit)
      },
      unreadCount: unreadCount[0].count
    })
  } catch (error) {
    console.error('Client notifications error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Mark notification as read
app.patch('/api/client/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    await pool.execute(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    )

    res.json({ message: 'Notificação marcada como lida' })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Mark all notifications as read
app.patch('/api/client/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = FALSE',
      [req.user.userId]
    )

    res.json({ message: 'Todas as notificações foram marcadas como lidas' })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// ===== SUBSCRIPTION PLANS MANAGEMENT =====

// Get subscription plans (admin only)
app.get('/api/admin/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [plans] = await pool.execute(
      'SELECT * FROM subscription_plans ORDER BY sort_order ASC, price ASC'
    )

    res.json({ plans })
  } catch (error) {
    console.error('Admin plans error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Create subscription plan (admin only)
app.post('/api/admin/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, duration_days, max_devices, features, is_popular, is_active, sort_order } = req.body

    if (!name || !price || !duration_days || !max_devices) {
      return res.status(400).json({ message: 'Nome, preço, duração e dispositivos máximos são obrigatórios' })
    }

    const planId = require('crypto').randomUUID()

    await pool.execute(
      `INSERT INTO subscription_plans (id, name, description, price, duration_days, max_devices, features, is_popular, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [planId, name, description, price, duration_days, max_devices, JSON.stringify(features || []), is_popular || false, is_active !== false, sort_order || 0]
    )

    res.status(201).json({ message: 'Plano criado com sucesso', id: planId })
  } catch (error) {
    console.error('Create plan error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Update subscription plan (admin only)
app.put('/api/admin/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, duration_days, max_devices, features, is_popular, is_active, sort_order } = req.body

    await pool.execute(
      `UPDATE subscription_plans SET name = ?, description = ?, price = ?, duration_days = ?, 
       max_devices = ?, features = ?, is_popular = ?, is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, price, duration_days, max_devices, JSON.stringify(features || []), is_popular, is_active, sort_order, id]
    )

    res.json({ message: 'Plano atualizado com sucesso' })
  } catch (error) {
    console.error('Update plan error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})

// Delete subscription plan (admin only)
app.delete('/api/admin/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Check if plan has active subscriptions
    const [activeSubscriptions] = await pool.execute(
      'SELECT COUNT(*) as count FROM subscriptions WHERE plan_id = ? AND status = "active"',
      [id]
    )

    if (activeSubscriptions[0].count > 0) {
      return res.status(400).json({ message: 'Não é possível excluir plano com assinaturas ativas' })
    }

    await pool.execute('DELETE FROM subscription_plans WHERE id = ?', [id])

    res.json({ message: 'Plano excluído com sucesso' })
  } catch (error) {
    console.error('Delete plan error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
})



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Algo deu errado!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado' })
})

// Start server
async function startServer() {
  await testConnection()
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`)
  })
}

startServer().catch(console.error)