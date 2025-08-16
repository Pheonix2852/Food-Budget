const fs = require('fs')
const crypto = require('crypto')
const http = require('http')
const https = require('https')
const { URL } = require('url')

const url = process.argv[2] || 'http://localhost:3000/api/clerk/webhooks'
const secret = process.argv[3] || process.env.CLERK_WEBHOOK_SECRET || 'whsec_OQSvtd15psqSUbd1StdBJyue0irJRGXg'

const body = fs.readFileSync('payload.json', 'utf8')
const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex')

;(async () => {
  try {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : http
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-clerk-signature': hmac }
    }

    const req = lib.request(opts, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        console.log('Status:', res.statusCode)
        console.log('Body:', data)
      })
    })

    req.on('error', (err) => console.error('Request error:', err))
    req.write(body)
    req.end()
  } catch (err) {
    console.error('Error:', err)
  }
})()
