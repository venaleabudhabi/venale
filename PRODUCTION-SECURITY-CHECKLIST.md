# 🔒 PRODUCTION DEPLOYMENT SECURITY CHECKLIST

## 📋 Pre-Deployment Checklist

### 🗄️ **MongoDB Atlas Security**

#### **Network Access**
- [ ] Remove `0.0.0.0/0` (Allow from Anywhere)
- [ ] Add production server IP address
- [ ] Add backup server IP (if applicable)
- [ ] Add office/admin IP addresses
- [ ] Enable VPC Peering (if using AWS/GCP/Azure)

**How to Configure:**
1. MongoDB Atlas → Network Access
2. Delete `0.0.0.0/0` entry
3. Add specific IPs:
   ```
   Production Server: xxx.xxx.xxx.xxx/32
   Backup Server:     xxx.xxx.xxx.xxx/32
   Admin Office:      xxx.xxx.xxx.xxx/32
   ```

#### **Database User Security**
- [ ] Create production-specific database user
- [ ] Use strong password (32+ characters, random)
- [ ] Grant minimum required privileges (readWrite on revive-refuel only)
- [ ] Rotate credentials every 90 days

**Current Credentials (CHANGE THESE):**
```
User: venaleabudhabi_db_user
Password: bGv2F7HNgOtlfU1i  ⚠️ EXPOSED IN CODE - CHANGE!
```

**Steps:**
1. MongoDB Atlas → Database Access
2. Create new user: `revive_prod_user`
3. Generate strong password: Use password manager
4. Set role: `readWrite` on `revive-refuel` database only

#### **Database Configuration**
- [ ] Enable MongoDB Audit Logs
- [ ] Set up automated backups (daily)
- [ ] Enable Point-in-Time Recovery
- [ ] Configure backup retention (30 days minimum)
- [ ] Enable encryption at rest
- [ ] Enable encryption in transit (TLS/SSL)

---

### 🔐 **Environment Variables Security**

#### **Backend .env (NEVER COMMIT TO GIT)**
- [ ] Change all default passwords
- [ ] Generate new JWT secret (256-bit random)
- [ ] Use production Stripe keys
- [ ] Set `NODE_ENV=production`
- [ ] Add `.env` to `.gitignore`

**Production .env Template:**
```bash
# Database
MONGODB_URI=mongodb+srv://NEW_USER:NEW_PASSWORD@cluster.mongodb.net/revive-refuel?retryWrites=true&w=majority

# JWT Security
JWT_SECRET=GENERATE_NEW_256_BIT_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=7d

# User Accounts - CHANGE ALL PASSWORDS
ADMIN_EMAIL=admin@yourcompany.ae
ADMIN_PASSWORD=STRONG_RANDOM_PASSWORD_HERE

STAFF_EMAIL=staff@yourcompany.ae
STAFF_PASSWORD=STRONG_RANDOM_PASSWORD_HERE

DRIVER_EMAIL=driver@yourcompany.ae
DRIVER_PASSWORD=STRONG_RANDOM_PASSWORD_HERE

# Payment Processing
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Server
PORT=5001
NODE_ENV=production

# CORS Origins (your frontend domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Frontend .env.local**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_VENUE_SLUG=revive-refuel-venale
```

---

### 👥 **User Account Security**

#### **Default Accounts - MUST CHANGE**
```
⚠️ CURRENT (INSECURE):
Admin:  admin@revive.ae  / Admin123!
Staff:  staff@revive.ae  / Staff123!
Driver: driver@revive.ae / Driver123!
```

**Action Required:**
1. After first deployment, immediately login as admin
2. Change all passwords to strong passwords (16+ characters)
3. Or delete default users and create new ones with proper emails
4. Enable 2FA if implementing authentication improvements

**Strong Password Requirements:**
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words
- Use password manager (1Password, Bitwarden, etc.)

---

### 🌐 **Backend API Security**

#### **Rate Limiting**
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Limit login attempts (5 per 15 minutes)
- [ ] Limit API calls per user
- [ ] Add CAPTCHA to login forms

#### **CORS Configuration**
- [ ] Set specific allowed origins (no `*`)
- [ ] Only allow your frontend domain
- [ ] Disable in production for unknown origins

**Update backend/src/server.ts:**
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

#### **Security Headers**
- [ ] Enable Helmet.js (already installed)
- [ ] Set CSP headers
- [ ] Enable HSTS
- [ ] Disable X-Powered-By

#### **Input Validation**
- [ ] Validate all user inputs
- [ ] Sanitize HTML/SQL injection attempts
- [ ] Implement request size limits
- [ ] Validate file uploads

---

### 🔒 **SSL/HTTPS Configuration**

#### **Frontend (Next.js)**
- [ ] Deploy with Vercel (automatic HTTPS)
- [ ] Or configure SSL certificate on your server
- [ ] Force HTTPS redirect
- [ ] Enable HSTS header

#### **Backend (Express)**
- [ ] Get SSL certificate (Let's Encrypt free)
- [ ] Configure HTTPS on Express
- [ ] Or use reverse proxy (Nginx) with SSL
- [ ] Enable HTTP to HTTPS redirect

---

### 🚀 **Deployment Platform Security**

#### **Server Hardening**
- [ ] Update OS packages
- [ ] Configure firewall (UFW/iptables)
- [ ] Disable root login
- [ ] Use SSH keys (disable password auth)
- [ ] Install fail2ban
- [ ] Enable automatic security updates

#### **Firewall Rules**
```bash
Allow: 22 (SSH), 80 (HTTP), 443 (HTTPS)
Deny: All other ports
Block: All except your admin IP for SSH
```

#### **Application Security**
- [ ] Run app as non-root user
- [ ] Use PM2 or systemd for process management
- [ ] Set up log rotation
- [ ] Monitor for security vulnerabilities

---

### 📊 **Monitoring & Logging**

#### **Required Monitoring**
- [ ] Set up error tracking (Sentry)
- [ ] Monitor API response times
- [ ] Track failed login attempts
- [ ] Alert on suspicious activity
- [ ] Monitor database connections

#### **Logging**
- [ ] Log all authentication attempts
- [ ] Log API errors
- [ ] Log database queries (in dev only)
- [ ] Rotate logs daily
- [ ] Retain logs for 90 days

---

### 💳 **Payment Security (Stripe)**

#### **Stripe Configuration**
- [ ] Use live API keys (not test keys)
- [ ] Enable 3D Secure (SCA compliance)
- [ ] Verify webhook signatures
- [ ] Never log card details
- [ ] Use Stripe Elements (already implemented)
- [ ] Set up fraud detection rules

#### **PCI Compliance**
- [ ] Never store card numbers
- [ ] Use Stripe's hosted payment page
- [ ] Implement HTTPS everywhere
- [ ] Regular security audits

---

### 📱 **Mobile App Security (APK)**

#### **When Building APK**
- [ ] Sign APK with production keystore
- [ ] Store keystore securely (not in repo)
- [ ] Enable ProGuard/R8 obfuscation
- [ ] Remove debug logs
- [ ] Use production API URLs
- [ ] Implement certificate pinning

---

## 🔄 **Continuous Security**

### **Weekly Tasks**
- [ ] Review access logs
- [ ] Check for failed login attempts
- [ ] Monitor error rates
- [ ] Review user activity

### **Monthly Tasks**
- [ ] Update dependencies (`npm audit fix`)
- [ ] Review security patches
- [ ] Rotate API keys if compromised
- [ ] Review user permissions
- [ ] Database backup verification

### **Quarterly Tasks**
- [ ] Change database passwords
- [ ] Review and update firewall rules
- [ ] Security audit
- [ ] Penetration testing
- [ ] Update SSL certificates (if manual)

---

## 🚨 **Emergency Procedures**

### **If Database Compromised**
1. Immediately revoke MongoDB user
2. Create new user with new credentials
3. Update environment variables
4. Rotate JWT secrets
5. Force all users to re-login
6. Audit database for unauthorized changes
7. Restore from backup if needed

### **If API Keys Leaked**
1. Immediately revoke compromised keys
2. Generate new keys
3. Update all deployments
4. Review logs for unauthorized access
5. Notify affected users if needed

### **Backup Contacts**
- MongoDB Support: https://support.mongodb.com/
- Stripe Support: https://support.stripe.com/
- Hosting Provider Support: [Add your provider]

---

## ✅ **Pre-Launch Final Checklist**

**24 Hours Before Launch:**
- [ ] All passwords changed from defaults
- [ ] MongoDB IP whitelist configured
- [ ] SSL certificates installed
- [ ] Backup system tested
- [ ] Error monitoring active
- [ ] All environment variables set
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers enabled
- [ ] Logs configured
- [ ] Payment system tested
- [ ] Emergency contacts documented

**Launch Day:**
- [ ] Monitor logs continuously
- [ ] Watch for errors
- [ ] Test all user flows
- [ ] Verify payment processing
- [ ] Check database connections
- [ ] Monitor server resources

**Post-Launch (First Week):**
- [ ] Daily log reviews
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Bug tracking
- [ ] Security incident monitoring

---

## 📞 **Support & Resources**

**MongoDB Atlas:**
- Dashboard: https://cloud.mongodb.com/
- Security Guide: https://docs.mongodb.com/manual/security/

**Stripe:**
- Dashboard: https://dashboard.stripe.com/
- Security Best Practices: https://stripe.com/docs/security

**OWASP Top 10:**
- https://owasp.org/www-project-top-ten/

---

## 🎯 **Priority Levels**

**🔴 CRITICAL (Do Before Launch):**
- Change all default passwords
- Configure MongoDB IP whitelist
- Enable HTTPS/SSL
- Set production environment variables
- Remove 0.0.0.0/0 from MongoDB

**🟡 HIGH (Do Within First Week):**
- Set up monitoring/logging
- Configure backups
- Implement rate limiting
- Security headers
- CORS configuration

**🟢 MEDIUM (Do Within First Month):**
- Regular security audits
- Penetration testing
- User training
- Documentation
- Disaster recovery plan

---

*Last Updated: December 13, 2025*
*Review and update this checklist regularly*
