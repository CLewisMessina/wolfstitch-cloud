# Wolfstitch Cloud 🚀

**AI-Powered Dataset Preparation Platform**  
*Transform any document into AI training data in seconds*

[![Production Status](https://img.shields.io/badge/Status-Production%20Live-brightgreen)](https://wolfstitch.dev)
[![API Health](https://img.shields.io/badge/API-Healthy-brightgreen)](https://api.wolfstitch.dev/health)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/CLewisMessina/wolfstitch-cloud-dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🌟 **What is Wolfstitch Cloud?**

Wolfstitch Cloud is the **premier platform for preparing AI training datasets** from documents. Convert PDFs, Word docs, presentations, and 40+ other formats into perfectly chunked, tokenized JSONL files ready for machine learning pipelines.

**🔥 Now Live**: [**wolfstitch.dev**](https://wolfstitch.dev)

### **Key Features**
- **📄 Universal Document Support**: PDF, DOCX, XLSX, PPT, TXT, HTML, MD, EPUB, and more
- **🧠 Intelligent Chunking**: Context-aware text segmentation with semantic boundaries
- **⚡ Lightning Fast**: Process documents in under 10 seconds
- **🎯 AI-Ready Output**: GPT-4 compatible tokenization and JSONL export
- **🛡️ Privacy First**: Zero data retention, end-to-end encryption
- **📱 Universal Access**: Works on any device with modern web browser

---

## 🚀 **Quick Start**

### **🌐 Web Interface**
1. **Visit [wolfstitch.dev](https://wolfstitch.dev)**
2. **Upload your document** (drag & drop or click)
3. **Configure chunking** (optional - smart defaults provided)
4. **Download JSONL results** (ready for AI training)

### **🔌 API Integration**
```bash
curl -X POST "https://api.wolfstitch.dev/api/v1/quick-process" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your-document.pdf" \
  -F "tokenizer=gpt-4" \
  -F "max_tokens=1000"
```

### **📦 Response Format**
```json
{
  "message": "File processed successfully",
  "filename": "your-document.pdf", 
  "chunks": 3,
  "total_tokens": 2019,
  "average_chunk_size": 673,
  "processing_time": 2.3,
  "preview": [
    {
      "text": "Document content preview...",
      "tokens": 820,
      "metadata": {
        "chunk_id": 1,
        "timestamp": "2025-06-25T10:30:00Z"
      }
    }
  ]
}
```

---

## 🏗️ **Architecture & Technology Stack**

### **Production Infrastructure**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │   Railway Cloud  │    │   PostgreSQL   │
│   (Global CDN)  │────│   (Auto-scaling) │────│   + Redis       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  wolfstitch.dev │    │   Next.js 15     │    │   FastAPI       │
│  (SSL + CNAME)  │    │   TypeScript     │    │   + Wolfcore    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Core Technologies**
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + Python + Wolfcore Library
- **Infrastructure**: Railway Cloud + Cloudflare CDN + GoDaddy DNS
- **Database**: PostgreSQL + Redis (scaling ready)
- **Deployment**: GitHub CI/CD with auto-deploy

### **Domain & Service Architecture**
Based on current infrastructure mapping:

| Service | Domain | Purpose | Status |
|---------|--------|---------|--------|
| **Production Frontend** | wolfstitch.dev | Main user interface | ✅ Live |
| **Production API** | api.wolfstitch.dev | Document processing API | ✅ Live |
| **Staging Frontend** | staging.wolfstitch.dev | Development testing | ✅ Active |
| **Staging API** | api-dev.wolfstitch.dev | API development | ✅ Active |

---

## 📈 **Performance & Capabilities**

| Metric | Value | Details |
|--------|-------|---------|
| **Processing Speed** | < 10 seconds | For typical 1-5MB documents |
| **Supported Formats** | 40+ file types | PDF, Office, Web, Text, Data |
| **Max File Size** | 100MB | Enterprise-grade capacity |
| **API Uptime** | 99.9%+ | Production SLA with monitoring |
| **Token Accuracy** | GPT-4 compatible | Precise tokenization |
| **Global Latency** | < 200ms | Cloudflare CDN optimized |
| **Concurrent Users** | Auto-scaling | Railway infrastructure |
| **Data Security** | Zero retention | Files processed and discarded |

---

## 🛠️ **Development**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Python 3.9+ and pip
- Git for version control

### **Local Development Setup**
```bash
# 1. Clone the repository
git clone https://github.com/CLewisMessina/wolfstitch-cloud-dev.git
cd wolfstitch-cloud-dev

# 2. Frontend development
cd frontend
npm install
npm run dev  # → http://localhost:3000

# 3. Backend development (optional - API is live)
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload  # → http://localhost:8000

# 4. Environment setup
cp .env.example .env.local  # Configure environment variables
```

### **Environment Configuration**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.wolfstitch.dev
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_NAME=Wolfstitch

# Backend (Railway managed in production)
ENVIRONMENT=production
DATABASE_URL=[auto-configured]
REDIS_URL=[auto-configured]
SECRET_KEY=[secure-key]
ALLOWED_HOSTS=api.wolfstitch.dev,localhost
```

### **Project Structure**
```
wolfstitch-cloud-dev/
├── frontend/                 # Next.js application
│   ├── src/app/             # App router pages  
│   ├── src/components/      # React components
│   ├── src/lib/            # Utilities and hooks
│   └── package.json        # Frontend dependencies
├── backend/                 # FastAPI application
│   ├── main.py             # API server entry point
│   ├── models/             # Data models and schemas
│   ├── api/                # API route handlers
│   └── requirements.txt    # Python dependencies
├── wolfcore/               # Core processing library
│   ├── __init__.py         # Library interface
│   ├── parsers.py          # Document parsing
│   ├── chunker.py          # Text chunking
│   └── processor.py        # Main processing engine
└── docs/                   # Project documentation
```

---

## 🧪 **Testing & Quality Assurance**

### **Automated Testing**
```bash
# System validation
python setup_railway.py

# Frontend tests  
cd frontend && npm test

# Backend tests
pytest backend/tests/

# API integration tests
python backend/test_api.py
```

### **Manual Testing Checklist**
- [ ] Upload various document formats (PDF, DOCX, TXT, etc.)
- [ ] Verify chunking quality and token accuracy  
- [ ] Test download functionality and JSONL format
- [ ] Check error handling with invalid/corrupted files
- [ ] Validate processing speed and resource usage
- [ ] Test mobile responsiveness and accessibility

### **Performance Monitoring**
- **Health Check**: [api.wolfstitch.dev/health](https://api.wolfstitch.dev/health)
- **API Documentation**: [api.wolfstitch.dev/docs](https://api.wolfstitch.dev/docs)
- **System Metrics**: Real-time monitoring via Railway dashboard
- **Error Tracking**: Comprehensive logging and alerting

---

## 🚀 **Deployment & Operations**

### **Production Deployment**
**Wolfstitch Cloud runs on Railway with full CI/CD automation:**

- **Auto-deployment**: Push to `main` branch triggers production deploy
- **Health monitoring**: Automated health checks and alerting  
- **Scaling**: Auto-scaling based on demand
- **SSL/TLS**: Automatic certificate management via Cloudflare
- **Backups**: Database backups and point-in-time recovery

### **Infrastructure Services**
```bash
# Production Services (Railway)
├── Frontend: 9okkzok6.up.railway.app → wolfstitch.dev
├── Backend: 9u9jyp65.up.railway.app → api.wolfstitch.dev  
├── Database: PostgreSQL (managed)
└── Cache: Redis (managed)

# Staging Services (Railway)  
├── Frontend: hdxldm16.up.railway.app → staging.wolfstitch.dev
├── Backend: qmtm3lpm.up.railway.app → api-dev.wolfstitch.dev
├── Database: PostgreSQL (staging)
└── Cache: Redis (staging)
```

### **Monitoring & Analytics**
- **Uptime Monitoring**: 99.9% SLA with instant alerts
- **Performance Metrics**: Response times, throughput, error rates
- **Usage Analytics**: Document processing volume and success rates
- **Security Monitoring**: Access logs and anomaly detection

---

## 🎯 **Roadmap & Future Development**

### **Phase 3: User Management & Monetization (Current Priority)**
**Timeline**: July 2025

- [ ] **User Authentication**: Clerk integration with social auth
- [ ] **Subscription Tiers**: Free, Pro, Team, Enterprise  
- [ ] **Payment Processing**: Stripe integration with billing portal
- [ ] **Usage Tracking**: Comprehensive analytics and limits
- [ ] **Customer Dashboard**: Account management and usage insights

### **Phase 4: Advanced Features (Q3 2025)**
- [ ] **Batch Processing**: Multiple file upload and parallel processing
- [ ] **Custom Chunking**: User-configurable chunk size and overlap strategies
- [ ] **Export Formats**: CSV, TXT, XML, and custom format options
- [ ] **API Keys**: Secure programmatic access with rate limiting
- [ ] **Webhook Integration**: Real-time processing notifications

### **Phase 5: Enterprise & AI Enhancement (Q4 2025)**
- [ ] **Team Collaboration**: Shared workspaces and project management
- [ ] **AI-Powered Features**: Semantic chunking and quality scoring
- [ ] **Advanced Analytics**: Detailed processing insights and optimization
- [ ] **Enterprise SSO**: SAML, LDAP, and custom authentication
- [ ] **White-label Solutions**: Custom branding and deployment options

### **Phase 6: Platform Expansion (2026)**
- [ ] **API Marketplace**: Third-party integrations and extensions
- [ ] **Custom Models**: Support for specialized tokenizers and models
- [ ] **Workflow Automation**: Scheduled processing and data pipelines
- [ ] **International Expansion**: Multi-language support and localization
- [ ] **Enterprise Platform**: Advanced features for large organizations

---

## 📊 **Current Status & Metrics**

### **Production Statistics** *(as of June 25, 2025)*
- **🚀 Status**: Production live and stable
- **⏱️ Uptime**: 99.9%+ since launch
- **📈 Growth**: 6-8 weeks ahead of original roadmap
- **🔧 Infrastructure**: Auto-scaling Railway deployment  
- **🛡️ Security**: End-to-end encryption, zero data retention
- **🌍 Global**: Cloudflare CDN for worldwide performance

### **Technical Achievements**
- ✅ **Multi-format Processing**: 40+ document types supported
- ✅ **Production API**: RESTful API with comprehensive documentation
- ✅ **Modern Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- ✅ **Cloud Infrastructure**: Scalable Railway deployment with monitoring
- ✅ **Performance Optimized**: Sub-10 second processing for most documents
- ✅ **Security Hardened**: HTTPS everywhere, input validation, CORS protection

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get involved:

### **Development Workflow**
1. **Fork the repository** and create a feature branch
2. **Set up local development** environment using instructions above
3. **Make your changes** with comprehensive tests  
4. **Follow code standards** (TypeScript, Python type hints, etc.)
5. **Submit a pull request** with detailed description

### **Contribution Guidelines**
- **Code Quality**: Maintain high standards with linting and testing
- **Documentation**: Update docs for any new features or changes
- **Testing**: Add tests for new functionality
- **Security**: Follow security best practices
- **Performance**: Consider impact on processing speed and resource usage

### **Bug Reports & Feature Requests**
- **Issues**: [GitHub Issues](https://github.com/CLewisMessina/wolfstitch-cloud-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CLewisMessina/wolfstitch-cloud-dev/discussions)
- **Security**: Email security@wolfstitch.dev for security-related issues

---

## 📞 **Support & Contact**

### **Get Help**
- **📖 API Documentation**: [api.wolfstitch.dev/docs](https://api.wolfstitch.dev/docs)
- **💬 GitHub Issues**: [Report bugs or request features](https://github.com/CLewisMessina/wolfstitch-cloud-dev/issues)
- **📧 Email Support**: [support@wolfstitch.dev](mailto:support@wolfstitch.dev)
- **💼 LinkedIn**: [@CLewisMessina](https://linkedin.com/in/clewismessina)

### **Business Inquiries**
- **Enterprise Solutions**: [enterprise@wolfstitch.dev](mailto:enterprise@wolfstitch.dev)
- **Partnership Opportunities**: [partnerships@wolfstitch.dev](mailto:partnerships@wolfstitch.dev)
- **Press & Media**: [press@wolfstitch.dev](mailto:press@wolfstitch.dev)

### **Status & Updates**
- **🔔 System Status**: Real-time status monitoring
- **📰 Product Updates**: Follow on LinkedIn for announcements
- **📊 Release Notes**: Check CHANGELOG.md for detailed version history
- **🎯 Roadmap**: Track progress on GitHub project boards

---

## 📄 **License & Legal**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **Terms of Service**
By using Wolfstitch Cloud, you agree to our [Terms of Service](https://wolfstitch.dev/terms) and [Privacy Policy](https://wolfstitch.dev/privacy).

### **Privacy & Security**
- **Zero Data Retention**: Files are processed and immediately discarded
- **End-to-End Encryption**: All data transmitted securely via HTTPS
- **GDPR Compliant**: Full compliance with data protection regulations
- **SOC 2 Ready**: Enterprise-grade security practices

---

## 🏆 **Acknowledgments**

**Wolfstitch Cloud** represents the culmination of modern web development practices, enterprise-grade infrastructure, and user-centered design. Special thanks to:

- **🤖 Claude (Anthropic)** for exceptional development partnership and technical guidance
- **🚄 Railway** for providing robust, scalable cloud infrastructure  
- **⚡ Cloudflare** for global content delivery and security services
- **🌐 The Open Source Community** for foundational tools and libraries
- **👥 Early Users** for feedback and validation during development

---

## 🎉 **Ready to Transform Your Documents?**

**Wolfstitch Cloud is live and ready to help you prepare AI training datasets from any document format.**

### **🚀 [Start Processing Files Now →](https://wolfstitch.dev)**

---

*Made with ❤️ by [Chris Lewis-Messina](https://linkedin.com/in/clewismessina)*  
*Last updated: June 25, 2025*