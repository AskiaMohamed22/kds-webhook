// webhook.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv/config");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  try {
    const event = req.body.event;
    const transaction = req.body.data;

    if (event === "transaction.approved") {
      const email = transaction.customer.email;
      console.log("Paiement reçu pour :", email);

      const response = await axios.get(`https://api.adalo.com/v0/apps/${process.env.ADALO_APP_ID}/collections/9lzcwhourspi8r9xm5cw87c2g`, {
        headers: {
          Authorization: `Bearer ${process.env.ADALO_API_KEY}`,
        },
      });

      const users = response.data;
      const user = users.find((u) => u.email === email);

      if (user) {
        await axios.patch(
          `https://api.adalo.com/v0/apps/${process.env.ADALO_APP_ID}/collections/9lzcwhourspi8r9xm5cw87c2g/${user.id}`,
          { isPaid: true },
          {
            headers: {
              Authorization: `Bearer ${process.env.ADALO_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Champ isPaid mis à jour ✅");
      } else {
        console.warn("Utilisateur introuvable ⚠️");
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Erreur dans le webhook:", error.message);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(PORT, () => console.log(`🚀 Webhook prêt sur le port ${PORT}`));
