const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

// ?? Connecte-toi à MongoDB ici (remplace par ta propre URI MongoDB Atlas)
mongoose.connect("mongodb+srv://<kdsadmin>:<kds12345>@cluster0.mongodb.net/kds", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ?? Schéma utilisateur
const userSchema = new mongoose.Schema({
  email: String,
  isActive: Boolean,
  dateActivated: Date,
});
const User = mongoose.model("User", userSchema);

// ? Route Webhook FedaPay
app.post("/webhook-fedapay", async (req, res) => {
  const { email } = req.body.data?.transaction?.customer || {};
  const status = req.body.data?.transaction?.status;

  if (email && status === "approved") {
    await User.findOneAndUpdate(
      { email },
      {
        email,
        isActive: true,
        dateActivated: new Date(),
      },
      { upsert: true }
    );
    console.log("? Utilisateur activé :", email);
  }

  res.status(200).send("OK");
});

// ?? Route de vérification pour Adalo
app.get("/users", async (req, res) => {
  const users = await User.find({ isActive: true });
  res.json(users);
});

// ?? Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("?? Serveur en ligne sur le port " + PORT);
});
