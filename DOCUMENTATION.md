# 📋 Documentation Architecture Complète - Système de Gestion de Factures

## 🏗️ Architecture Générale

```
┌─────────────┐    REST/GraphQL     ┌─────────────┐    RabbitMQ      ┌─────────────┐
│             │    (HTTP/Upload)    │             │    (base64)      │             │
│  Frontend   │ ◄─────────────────► │ public_api  │ ────────────────► │ ocr_service │
│  (Next.js)  │                     │ (NestJS)    │                  │  (NestJS)   │
│             │                     │             │                  │             │
└─────────────┘                     └─────────────┘                  └─────────────┘
                                            ▲                                 │
                                            │ RabbitMQ                        │ RabbitMQ
                                            │ (invoice_data)                  │ (extracted_text)
                                            │                                 ▼
                                    ┌─────────────────┐                ┌─────────────────┐
                                    │ PostgreSQL      │                │ text_treatment  │
                                    │ + Prisma ORM    │                │ (NestJS + LLM)  │
                                    │ + AWS S3        │                │                 │
                                    └─────────────────┘                └─────────────────┘
```

## 🔄 Workflow Complet

### 1. **Upload de Facture (Frontend → public_api)**

```typescript
// Frontend envoie
POST /invoices
Content-Type: multipart/form-data

{
  file: File,                    // PDF, image, ou document
  name: "Facture Client ABC",
  date: "2025-06-17",
  type: "EMIS" | "RECUS",
  tagIds?: [1, 2, 3]            // Tags optionnels
}
```

### 2. **Traitement Initial (public_api)**

```typescript
// 1. Validation du fichier (10MB max, types autorisés)
// 2. Upload vers AWS S3 (s3://bucket/invoices/{userId}/{uuid}.ext)
// 3. Sauvegarde en base PostgreSQL (sans invoice_data)
// 4. Envoi vers ocr_service via RabbitMQ

const invoice = await prisma.invoice.create({
  data: {
    name,
    date,
    type,
    filePath: "s3://...",
    userId,
    invoiceData: [], // Vide, sera rempli par le workflow
  },
});

// Message RabbitMQ vers OCR
rabbitmq.emit("process_invoice", {
  invoice_id: invoice.id,
  content: file.buffer.toString("base64"),
  fileName: file.originalname,
});
```

### 3. **Extraction OCR (ocr_service → text_treatment_service)**

```typescript
@MessagePattern('process_invoice')
async processInvoice(data: {
  invoice_id: number;
  content: string;    // base64
  fileName: string;
}) {
  // 1. Décoder le fichier base64
  const buffer = Buffer.from(data.content, 'base64');

  // 2. Extraire le texte (OCR pour images, parsing pour PDF)
  const extractedText = await this.extractTextFromFile(buffer);

  // 3. Envoyer vers text_treatment_service
  this.client.emit('analyze_invoice', {
    invoice_id: data.invoice_id,
    content: extractedText
  });
}
```

### 4. **Analyse LLM (text_treatment_service → public_api)**

```typescript
@MessagePattern('analyze_invoice')
async analyzeInvoice(data: {
  invoice_id: number;
  content: string;    // Texte extrait
}) {
  // 1. Analyse avec LLM (OpenRouter/Mistral)
  const analysis = await this.analyzWithLLM(data.content);

  // 2. Extraction des lignes de facture
  // 3. Envoi de chaque ligne vers public_api
  for (const line of analysis.lines) {
    this.publicApiClient.emit('invoice_data', {
      invoice_id: data.invoice_id,
      content: line.description,
      amount: line.amount
    });
  }
}
```

### 5. **Finalisation (public_api)**

```typescript
@MessagePattern('invoice_data')
async handleInvoiceData(data: {
  invoice_id: number;
  content: string;
  amount: number;
}) {
  // Ajout des lignes de facture en base
  await prisma.invoiceData.create({
    data: {
      content: data.content,
      amount: data.amount,
      invoiceId: data.invoice_id
    }
  });
}
```

## 📊 Modèles de Données

### Base de Données (PostgreSQL + Prisma)

```prisma
model Invoice {
  id          Int           @id @default(autoincrement())
  name        String                           // "Facture Client ABC"
  filePath    String?                          // "s3://bucket/invoices/123/uuid.pdf"
  createdAt   DateTime      @default(now())    // Timestamp création
  date        DateTime                         // Date de la facture
  type        InvoiceType                      // "EMIS" | "RECUS"

  // Relations
  userId      Int
  user        User          @relation(fields: [userId], references: [id])
  invoiceData InvoiceData[]                    // Lignes de facturation (ajoutées par LLM)
  invoiceTags InvoiceTag[]                     // Tags associés
}

model InvoiceData {
  id         Int       @id @default(autoincrement())
  content    String                           // "Développement web"
  amount     Float                            // 1200.50
  invoiceId  Int
  invoice    Invoice   @relation(fields: [invoiceId], references: [id])
}

enum InvoiceType {
  EMIS   // Facture émise (envoyée à un client)
  RECUS  // Facture reçue (d'un fournisseur)
}
```

### TypeScript Types pour Frontend

```typescript
// Création d'une facture
interface CreateInvoiceInput {
  name: string;
  date: Date;
  type: "EMIS" | "RECUS";
  tagIds?: number[];
}

// Réponse complète
interface Invoice {
  id: number;
  name: string;
  filePath?: string; // Chemin S3
  createdAt: Date;
  date: Date;
  type: "EMIS" | "RECUS";
  userId: number;
  invoiceData: InvoiceData[]; // Lignes ajoutées par LLM
}

interface InvoiceData {
  id: number;
  content: string; // Description de la ligne
  amount: number; // Montant de la ligne
}

// Réponse paginée
interface PaginatedInvoiceResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## 🔌 APIs Disponibles

### REST API (Recommandé pour uploads)

| Méthode  | Endpoint                    | Description            | Auth | Body/Params           |
| -------- | --------------------------- | ---------------------- | ---- | --------------------- |
| `POST`   | `/invoices`                 | Créer facture + upload | JWT  | `multipart/form-data` |
| `GET`    | `/invoices?page=1&limit=10` | Liste paginée          | JWT  | Query params          |
| `GET`    | `/invoices/:id`             | Détails facture        | JWT  | Param `:id`           |
| `PUT`    | `/invoices/:id`             | Modifier facture       | JWT  | `multipart/form-data` |
| `DELETE` | `/invoices/:id`             | Supprimer facture      | JWT  | Param `:id`           |

#### Exemple Upload REST

```javascript
const formData = new FormData();
formData.append("file", selectedFile);
formData.append("name", "Facture Client ABC");
formData.append("date", new Date().toISOString());
formData.append("type", "EMIS");
formData.append("tagIds", JSON.stringify([1, 2]));

const response = await fetch("/invoices", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
  body: formData,
});
```

### GraphQL API

```graphql
# Queries
query GetInvoices($page: Int = 1, $limit: Int = 10) {
  invoices(page: $page, limit: $limit) {
    invoices {
      id
      name
      filePath
      createdAt
      date
      type
      invoiceData {
        id
        content
        amount
      }
    }
    total
    totalPages
  }
}

query GetInvoice($id: Int!) {
  invoice(id: $id) {
    id
    name
    filePath
    date
    type
    invoiceData {
      content
      amount
    }
  }
}

# Mutations
mutation CreateInvoice($input: CreateInvoiceInput!) {
  createInvoice(createInvoiceInput: $input) {
    id
    name
    filePath
    date
    type
  }
}

mutation RemoveInvoice($id: Int!) {
  removeInvoice(id: $id)
}
```

## 🔐 Authentification

**OBLIGATOIRE** : Toutes les requêtes nécessitent un JWT token.

```javascript
// Headers requis
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "Content-Type": "application/json" // ou multipart/form-data pour uploads
}
```

## 📁 Gestion des Fichiers

### Types Supportés

- **PDF** : `.pdf` (recommandé)
- **Images** : `.jpg`, `.jpeg`, `.png`, `.gif`
- **Documents** : `.doc`, `.docx`

### Contraintes

- **Taille max** : 10MB
- **Stockage** : AWS S3
- **Format chemin** : `s3://bucket/invoices/{userId}/{uuid}.extension`

### Validation Frontend

```typescript
const validateFile = (file: File): string | null => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    return "Type de fichier non supporté";
  }

  if (file.size > 10 * 1024 * 1024) {
    return "Le fichier ne peut pas dépasser 10MB";
  }

  return null; // Valide
};
```

## 🚀 Recommandations Frontend (Next.js)

### 1. Structure de Dossiers Suggérée

```
src/
├── components/
│   ├── invoice/
│   │   ├── InvoiceList.tsx         // Liste paginée
│   │   ├── InvoiceCard.tsx         // Carte d'affichage
│   │   ├── InvoiceForm.tsx         // Formulaire création/édition
│   │   ├── InvoiceDetails.tsx      // Vue détaillée
│   │   └── FileUpload.tsx          // Drag & drop upload
│   └── ui/
│       ├── Pagination.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useInvoices.ts              // Hook pour liste
│   ├── useInvoice.ts               // Hook pour détail
│   └── useInvoiceMutations.ts      // Hooks pour CRUD
├── services/
│   ├── api.ts                      // Client HTTP
│   └── graphql.ts                  // Client GraphQL
└── types/
    └── invoice.ts                  // Types TypeScript
```

### 2. Hooks React Recommandés

```typescript
// Hook pour la liste paginée
const useInvoices = (page = 1, limit = 10, filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: ["invoices", page, limit, filters],
    queryFn: () => api.getInvoices({ page, limit, ...filters }),
    keepPreviousData: true,
  });
};

// Hook pour une facture
const useInvoice = (id: number) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  });
};

// Hooks pour les mutations
const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => api.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
```

### 3. Pages Suggérées

```typescript
// pages/invoices/index.tsx - Liste des factures
export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const { data, isLoading } = useInvoices(page, 10, filters);

  return (
    <div>
      <InvoiceFilters onFiltersChange={setFilters} />
      <InvoiceList invoices={data?.invoices} loading={isLoading} />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

// pages/invoices/new.tsx - Créer une facture
export default function NewInvoicePage() {
  const createMutation = useCreateInvoice();

  return (
    <InvoiceForm
      onSubmit={(data) => createMutation.mutate(data)}
      loading={createMutation.isLoading}
    />
  );
}

// pages/invoices/[id].tsx - Détails d'une facture
export default function InvoiceDetailsPage() {
  const { id } = useRouter().query;
  const { data: invoice, isLoading } = useInvoice(Number(id));

  return <InvoiceDetails invoice={invoice} loading={isLoading} />;
}
```

### 4. États de Processing à Gérer

```typescript
enum InvoiceStatus {
  UPLOADED = "UPLOADED",           // Fichier uploadé, en attente OCR
  PROCESSING = "PROCESSING",       // En cours de traitement (OCR/LLM)
  COMPLETED = "COMPLETED",         // Données extraites
  ERROR = "ERROR"                  // Erreur dans le workflow
}

// Composant de statut
const InvoiceStatusBadge = ({ invoice }: { invoice: Invoice }) => {
  const hasData = invoice.invoiceData?.length > 0;
  const status = hasData ? 'COMPLETED' : 'PROCESSING';

  return (
    <Badge variant={status === 'COMPLETED' ? 'success' : 'warning'}>
      {status === 'COMPLETED' ? 'Traité' : 'En cours...'}
    </Badge>
  );
};
```

## 🔧 Configuration Frontend

### Variables d'Environnement (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
NEXT_PUBLIC_MAX_FILE_SIZE=10485760    # 10MB
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3001
```

### Packages Recommandés (package.json)

```json
{
  "dependencies": {
    "@apollo/client": "^3.8.0", // GraphQL client
    "@tanstack/react-query": "^4.0.0", // State management & cache
    "axios": "^1.5.0", // HTTP client
    "react-dropzone": "^14.2.0", // File upload
    "react-hook-form": "^7.46.0", // Formulaires
    "zod": "^3.22.0", // Validation
    "@hookform/resolvers": "^3.3.0", // Validation avec react-hook-form
    "next-auth": "^4.23.0", // Authentification
    "tailwindcss": "^3.3.0", // Styling
    "lucide-react": "^0.284.0" // Icônes
  }
}
```

## 🎨 Composants UX/UI Suggérés

### 1. Upload de Fichier avec Drag & Drop

```typescript
const FileUpload = ({ onFileSelect, loading }: FileUploadProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => onFileSelect(files[0]),
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-8 text-center ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p>Glissez-déposez votre facture ou cliquez pour sélectionner</p>
          <p className="text-sm text-gray-500">
            PDF, images, documents Word (max 10MB)
          </p>
        </div>
      )}
    </div>
  );
};
```

### 2. Liste de Factures avec Filtres

```typescript
const InvoiceList = ({ invoices, loading }: InvoiceListProps) => {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="grid gap-4">
      {invoices?.map(invoice => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
};

const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
  const totalAmount = invoice.invoiceData?.reduce((sum, data) => sum + data.amount, 0) || 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{invoice.name}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(invoice.date), 'dd/MM/yyyy')}
          </p>
          <InvoiceStatusBadge invoice={invoice} />
        </div>
        <div className="text-right">
          <p className="font-bold">{totalAmount.toFixed(2)} €</p>
          <p className="text-sm text-gray-500">{invoice.type}</p>
        </div>
      </div>

      {invoice.invoiceData?.length > 0 && (
        <div className="mt-2 text-sm">
          <p className="text-gray-600">
            {invoice.invoiceData.length} ligne(s) détectée(s)
          </p>
        </div>
      )}
    </div>
  );
};
```

## 🐛 Gestion d'Erreurs

### Codes d'Erreur HTTP

```typescript
const ERROR_MESSAGES = {
  400: "Données invalides ou fichier non supporté",
  401: "Token d'authentification manquant ou invalide",
  403: "Accès refusé à cette facture",
  404: "Facture introuvable",
  413: "Fichier trop volumineux (max 10MB)",
  422: "Type de fichier non supporté",
  500: "Erreur serveur, veuillez réessayer",
};

// Hook pour gestion d'erreurs
const useErrorHandler = () => {
  return (error: any) => {
    const status = error.response?.status;
    const message =
      ERROR_MESSAGES[status] || "Une erreur inattendue s'est produite";

    toast.error(message);
    console.error("API Error:", error);
  };
};
```

## 📊 Exemples de Données

### Facture Complète (après traitement LLM)

```typescript
const exampleInvoice: Invoice = {
  id: 123,
  name: "Facture Développement Web",
  filePath: "s3://bucket/invoices/user456/uuid-789.pdf",
  createdAt: "2025-06-17T10:00:00Z",
  date: "2025-06-15T00:00:00Z",
  type: "EMIS",
  userId: 456,
  invoiceData: [
    {
      id: 1,
      content: "Développement site web e-commerce",
      amount: 2500.0,
    },
    {
      id: 2,
      content: "Maintenance et support (3 mois)",
      amount: 750.0,
    },
    {
      id: 3,
      content: "Formation équipe",
      amount: 500.0,
    },
  ],
  // Total calculé: 3750.00 €
};
```

### Réponse API Paginée

```typescript
const examplePaginatedResponse: PaginatedInvoiceResponse = {
  invoices: [exampleInvoice, ...],
  total: 47,
  page: 2,
  limit: 10,
  totalPages: 5
};
```

## 🎯 Points Clés pour le Développement

1. **Temps Réel** : Les `invoiceData` sont ajoutées de manière asynchrone. Implémentez du polling ou WebSockets pour rafraîchir les données.

2. **États de Chargement** : Gérez 3 états distincts :

   - Upload en cours
   - Traitement (OCR + LLM)
   - Terminé

3. **Optimistic Updates** : Pour une meilleure UX, affichez immédiatement la facture après upload, même sans les données LLM.

4. **Cache** : Utilisez React Query pour le cache intelligent et la synchronisation.

5. **Validation** : Validez côté client ET serveur avec Zod pour la cohérence.

Cette architecture offre un système complet de gestion de factures avec traitement automatique par IA ! 🚀
