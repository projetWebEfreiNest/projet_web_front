# Guide de débogage - Authentification JWT avec URQL

## Problème résolu ✅

Le problème "Unauthorized" était dû au fait que le token JWT n'était pas automatiquement inclus dans les requêtes GraphQL.

## Solutions implémentées

### 1. Configuration du client URQL (`src/lib/urql/client.ts`)

```typescript
export const browserUrqlClient = createClient({
  url: API_CONFIG.GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = getTokenFromCookies();
    return {
      credentials: "include",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  },
});
```

**Changements clés :**

- `fetchOptions` est maintenant une fonction qui s'exécute à chaque requête
- Le token est récupéré dynamiquement depuis les cookies
- L'header `Authorization` est ajouté automatiquement si un token existe

### 2. Simplification du service des factures

Le service `InvoiceService` n'a plus besoin de gérer manuellement le token car c'est fait automatiquement par le client URQL.

### 3. Nettoyage des ViewModels

Suppression de toutes les méthodes `setToken()` car elles ne sont plus nécessaires.

## Comment vérifier que ça fonctionne

### 1. Via les outils de développement du navigateur

1. Ouvrir l'application sur `http://localhost:3004`
2. Se connecter avec un compte valide
3. Naviguer vers `/invoices`
4. Ouvrir les DevTools (F12) → onglet Network
5. Observer les requêtes GraphQL :
   - L'header `Authorization: Bearer <token>` doit être présent
   - Les requêtes ne doivent plus retourner d'erreur 401

### 2. Via la console du navigateur

```javascript
// Vérifier que le token est dans les cookies
document.cookie.split(";").find((c) => c.includes("token"));

// Tester une requête GraphQL manuellement
fetch("http://localhost:3000/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer " +
      document.cookie
        .split(";")
        .find((c) => c.includes("token"))
        ?.split("=")[1],
  },
  body: JSON.stringify({
    query: `query { invoices(page: 1, limit: 10) { total } }`,
  }),
});
```

## Points importants

1. **Cookie vs LocalStorage** : Le token est stocké dans les cookies (plus sécurisé)
2. **Synchronisation automatique** : Pas besoin de gérer manuellement la synchronisation du token
3. **Côté serveur** : Le backend doit accepter l'header `Authorization: Bearer <token>`

## Erreurs possibles et solutions

### "Cannot read properties of undefined"

- Vérifier que `API_CONFIG.COOKIE_CONFIG.TOKEN_NAME` est bien défini
- S'assurer que le cookie existe après la connexion

### "CORS error"

- Vérifier que le backend autorise les headers `Authorization`
- Configurer `credentials: 'include'` des deux côtés

### "Token expired"

- Implémenter un refresh token ou redirection vers login
- Vérifier la durée de vie du token côté backend

## Test des fonctionnalités

1. **Connexion** → Token sauvé dans les cookies ✅
2. **Liste des factures** → Requête avec token ✅
3. **Création de facture** → Mutation avec token ✅
4. **Modification de facture** → Mutation avec token ✅
5. **Suppression de facture** → Mutation avec token ✅

L'authentification JWT est maintenant complètement intégrée et automatique ! 🎉
