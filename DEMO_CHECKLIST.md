# 🛡️ SecureDrop Demo Preparation Checklist

## **Pre-Demo Setup (15 minutes before demo)**

### **1. Environment Setup**

- [ ] **Start development server**
  ```bash
  npm run dev
  ```
- [ ] **Verify server is running:** http://localhost:8080
- [ ] **Check all demo files exist in `demo-files/` folder**

### **2. Browser Setup**

- [ ] **Open 3 browser tabs:**
  - Tab 1: http://localhost:8080 (Landing page)
  - Tab 2: http://localhost:8080/demo (Demo interface)
  - Tab 3: http://localhost:8080/auth (Admin login)
- [ ] **Clear browser cache and cookies**
- [ ] **Disable browser notifications**

### **3. Demo Files Verification**

Ensure all demo files are created:

- [ ] `demo-files/clean-document.txt` ✅
- [ ] `demo-files/legitimate-logo.svg` ✅
- [ ] `demo-files/malicious-xss.html` ❌
- [ ] `demo-files/sql-injection-payload.sql` ❌
- [ ] `demo-files/code-injection.php` ❌
- [ ] `demo-files/fake-image.jpg` ❌
- [ ] `demo-files/eicar-test.txt` ❌
- [ ] `demo-files/path-traversal-attack.txt` ❌

### **4. Admin Credentials Ready**

```
Email: admin@securedrop.dev
Password: SecureDemo2024!
```

- [ ] **Test admin login works**
- [ ] **Verify dashboard loads properly**

### **5. CLI Tools Test**

- [ ] **Test CLI help command:**
  ```bash
  node src/cli/securedrop-cli.ts --help
  ```
- [ ] **Terminal window ready for CLI demo**

### **6. Presentation Setup**

- [ ] **Screen sharing configured**
- [ ] **Microphone and audio tested**
- [ ] **Demo script (DEMO_SCRIPT.md) open for reference**
- [ ] **Timer set for 30 minutes**

---

## **During Demo - Quick Reference**

### **Demo File Upload Order:**

1. `legitimate-logo.svg` (PASS)
2. `clean-document.txt` (PASS)
3. `malicious-xss.html` (BLOCKED - XSS)
4. `sql-injection-payload.sql` (BLOCKED - SQL Injection)
5. `code-injection.php` (BLOCKED - Code Injection)
6. `fake-image.jpg` (BLOCKED - Magic Byte Mismatch)
7. `eicar-test.txt` (BLOCKED - Virus Signature)

### **Key URLs:**

- **Landing:** http://localhost:8080
- **Demo:** http://localhost:8080/demo
- **Admin:** http://localhost:8080/auth
- **Dashboard:** http://localhost:8080/dashboard

### **Security Profiles to Demo:**

1. **Basic Security** - Files 1-2
2. **Moderate Security** - Files 3-4
3. **Strict Security** - Files 5-7

---

## **Troubleshooting Guide**

### **If Server Won't Start:**

```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill process if needed
kill -9 <PID>

# Restart server
npm run dev
```

### **If Files Don't Upload:**

- Check console for JavaScript errors
- Verify Supabase connection
- Use CLI scan as backup demonstration

### **If Admin Dashboard Fails:**

- Try refreshing the page
- Check authentication status
- Fall back to demo interface configuration

### **If CLI Tools Fail:**

- Verify Node.js version (18+)
- Check file permissions
- Run from project root directory

---

## **Post-Demo Follow-up**

### **Immediate Actions:**

- [ ] **Collect attendee contact information**
- [ ] **Schedule technical deep-dive meetings**
- [ ] **Send demo recording link**
- [ ] **Share documentation links**

### **Demo Metrics to Track:**

- [ ] **Number of attendees**
- [ ] **Questions asked by category (security/development/business)**
- [ ] **Follow-up meetings scheduled**
- [ ] **Interest level (1-10 scale)**

### **Follow-up Materials to Send:**

- [ ] **Product documentation**
- [ ] **Integration guides**
- [ ] **Security whitepaper**
- [ ] **Pricing information**
- [ ] **Case studies**

---

## **Emergency Contacts**

**Technical Issues:**

- Development Team: [contact info]
- Infrastructure Team: [contact info]

**Business Questions:**

- Sales Team: [contact info]
- Product Team: [contact info]

**Demo Support:**

- Backup Presenter: [contact info]
- Technical Support: [contact info]
