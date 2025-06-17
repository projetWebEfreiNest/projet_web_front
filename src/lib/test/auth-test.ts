// Test de l'authentification et des requêtes GraphQL
console.log("Testing URQL client with JWT token...");

// Simulation d'un test - à intégrer dans une vraie page de test si nécessaire
const testUrqlClient = async () => {
  try {
    // Ce test pourrait être intégré dans une page de dev ou de test
    console.log(
      "Client URQL configuré pour inclure automatiquement le token JWT"
    );
    console.log("Headers attendus:", {
      Authorization: "Bearer <token_from_cookies>",
      credentials: "include",
    });
  } catch (error) {
    console.error("Erreur lors du test:", error);
  }
};

export default testUrqlClient;
