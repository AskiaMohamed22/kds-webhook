// webhook.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv/config");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Webhook en ligne et prêt à recevoir des requêtes POST!");
});

app.post("/webhook", async (req, res) => {
  console.log("📦 Données reçues :", JSON.stringify(req.body, null, 2));

  try {
    const event = req.body.event;
    const transaction = req.body.data;

    if (event === "transaction.approved") {
      const email = transaction.customer.email;
      const metadata = transaction.metadata; // Assure-toi d'envoyer des metadata dans le paiement
      const userId = metadata?.user_id; // Ton ID Adalo transmis lors du paiement

      console.log("✅ Paiement reçu pour :", email);
      console.log("🔍 ID Utilisateur Adalo :", userId);

      if (!userId) {
        console.error("❌ Aucun ID utilisateur fourni dans la transaction.");
        return res.status(400).send("Pas d'ID utilisateur.");
      }

      await axios.patch(
        `https://api.adalo.com/v0/apps/${process.env.ADALO_APP_ID}/collections/TON_COLLECTION_ID/${userId}`,
        { isPaid: true },
        {
          headers: {
            Authorization: `Bearer ${process.env.ADALO_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🟢 Champ isPaid mis à jour pour l'utilisateur :", userId);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("💥 Erreur dans le webhook:", error.message);
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(PORT, () => console.log(`🚀 Webhook prêt sur le port ${PORT}`));
