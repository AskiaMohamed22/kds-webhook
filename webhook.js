// webhook.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv/config");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Route GET pour vérifier si le serveur est en ligne
app.get("/", (req, res) => {
  res.send("Webhook en ligne et prêt à recevoir des requêtes POST!");
});

// Route POST pour gérer les requêtes du webhook
app.post("/webhook", async (req, res) => {
  console.log("📦 Données reçues :", JSON.stringify(req.body, null, 2)); // 🔍 debug log

  try {
    const event = req.body.event;
    const transaction = req.body.data;

    if (event === "transaction.approved") {
      const email = transaction.customer.email;
      console.log("✅ Paiement reçu pour :", email);

      const response = await axios.get(
        `https://api.adalo.com/v0/apps/${process.env.ADALO_APP_ID}/collections/9lzcwhourspi8r9xm5cw87c2g`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ADALO_API_KEY}`,
          },
        }
      );

      const users = response.data;
      const user = users.find((u) => u.email === email);

      if (user) {
        await axios.patch(
          `https://api.adalo.com/v0/apps/${process.env.ADALO_APP_ID}/collections/t_413bc1e32a8d470f8c22e0a0dc3b66f8/${user.id}`,
          { isPaid: true },
          {
            headers: {
              Authorization: `Bearer ${process.env.ADALO_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("🟢 Champ isPaid mis à jour ✅");
      } else {
        console.warn("⚠️ Utilisateur introuvable dans Adalo");
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("💥 Erreur dans le webhook:", error.message);
    console.error(error); // 🔍 affiche tous les détails
    res.status(500).send("Erreur serveur");
  }
});

app.listen(PORT, () => console.log(`🚀 Webhook prêt sur le port ${PORT}`));
