# ZION STOCK OS - Backend API

## 🔐 Système d'Authentification JWT

### Architecture Sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                    ZION STOCK OS v1.1                        │
│                   JWT Authentication Flow                     │
└─────────────────────────────────────────────────────────────┘

    ┌──────────┐     POST /auth/login      ┌──────────────┐
    │  Client  │ ─────────────────────────►│   FastAPI    │
    │  React   │     {email, password}     │   Backend    │
    └──────────┘                           └──────────────┘
         │                                        │
         │                                        ▼
         │                               ┌──────────────┐
         │                               │  PostgreSQL  │
         │                               │   (Users)    │
         │                               └──────────────┘
         │                                        │
         │      {access_token,                    │
         │       refresh_token,                   │
         │◄──────user}────────────────────────────┘
         │
         │      Authorization: Bearer <token>
         │ ─────────────────────────────────────►
         │      GET /api/v1/products
         │
```

### Endpoints Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Connexion utilisateur | ❌ |
| POST | `/api/v1/auth/register` | Inscription | ❌ |
| POST | `/api/v1/auth/refresh` | Rafraîchir token | ❌ |
| GET | `/api/v1/auth/me` | Profil utilisateur | ✅ |
| POST | `/api/v1/auth/change-password` | Changer mot de passe | ✅ |
| POST | `/api/v1/auth/logout` | Déconnexion | ✅ |

### Rôles & Permissions

| Rôle | Permissions |
|------|-------------|
| `admin` | Accès complet - Gestion utilisateurs, entrepôts, paramètres |
| `magasinier` | Gestion stock, produits, mouvements, fournisseurs |
| `vendeur` | Consultation stock, création mouvements sortie, clients |

### Configuration JWT

```python
# .env
SECRET_KEY=your-256-bit-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Token Structure

**Access Token (30 min)**
```json
{
  "sub": "user-uuid",
  "exp": 1704067200,
  "iat": 1704065400,
  "type": "access",
  "role": "admin",
  "company_id": "company-uuid"
}
```

**Refresh Token (7 jours)**
```json
{
  "sub": "user-uuid",
  "exp": 1704672000,
  "iat": 1704065400,
  "type": "refresh",
  "jti": "unique-token-id"
}
```

## 🚀 Installation

```bash
# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Installer dépendances
pip install -r requirements.txt

# Configurer variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer migrations
alembic upgrade head

# Démarrer serveur
uvicorn app.main:app --reload
```

## 📚 Documentation API

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI: http://localhost:8000/api/openapi.json

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (cost factor 12)
- ✅ Tokens JWT signés HS256
- ✅ Refresh token rotation
- ✅ Validation force mot de passe
- ✅ Rate limiting recommandé en production
- ✅ CORS configuré
- ✅ HTTPS obligatoire en production

## 📁 Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py          # Dependencies (auth)
│   │   └── routes/
│   │       ├── auth.py      # Auth endpoints
│   │       ├── users.py     # User management
│   │       ├── products.py  # Product CRUD
│   │       ├── stock.py     # Stock & movements
│   │       └── ...
│   ├── core/
│   │   ├── config.py        # Settings
│   │   ├── database.py      # DB connection
│   │   └── security.py      # JWT & password
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── main.py              # FastAPI app
├── alembic/                 # Migrations
├── requirements.txt
└── .env.example
```
