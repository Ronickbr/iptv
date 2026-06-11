const { spawn } = require('child_process')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const webPort = process.env.PORT || '3000'
const apiPort = process.env.API_PORT || '3001'
const sharedEnv = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'production'
}

let shuttingDown = false
const children = new Map()

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children.values()) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }

  setTimeout(() => process.exit(exitCode), 200)
}

function startProcess(name, command, args, env) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env,
    stdio: 'inherit'
  })

  children.set(name, child)

  child.on('exit', (code, signal) => {
    children.delete(name)

    if (shuttingDown) {
      return
    }

    const normalizedCode = typeof code === 'number' ? code : 1
    console.error(`${name} finalizou inesperadamente`, { code: normalizedCode, signal })
    stopAll(normalizedCode)
  })

  child.on('error', (error) => {
    console.error(`Falha ao iniciar ${name}:`, error)
    stopAll(1)
  })

  return child
}

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))

startProcess('api', process.execPath, [path.join(rootDir, 'server', 'index.js')], {
  ...sharedEnv,
  API_PORT: apiPort
})

const fs = require('fs')
const nextStandaloneServerPath = path.join(rootDir, '.next', 'standalone', 'server.js')
const useStandalone = fs.existsSync(nextStandaloneServerPath)

const command = process.execPath
const args = useStandalone 
  ? [nextStandaloneServerPath] 
  : [require.resolve('next/dist/bin/next'), 'start', '-H', '0.0.0.0', '-p', webPort]

startProcess('web', command, args, {
  ...sharedEnv,
  PORT: webPort,
  HOSTNAME: '0.0.0.0'
})
