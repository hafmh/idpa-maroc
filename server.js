import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité renforcée
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false })); // on désactive CSP car on a des images externes
app.use(compression());
app.use(cors());
app.use(morgan('combined'));

// Protection anti-spam
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes, réessayez dans 10 minutes" }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// === API ROUTES ===
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/products', async (req, res) => {
  // À PROTÉGER PLUS TARD avec mot de passe ou login
  const { name, category, price, description, image } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: 'Données manquantes' });

  try {
    const result = await pool.query(
      `INSERT INTO products (name, category, price, description, image) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), category, parseFloat(price), description?.trim(), image || 'images/no-image.jpg']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur ajout produit' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { name, phone, city, address, items, total } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO orders (customer_name, phone, city, address, items, total) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, phone, city, address, JSON.stringify(items), total]
    );

    const orderId = result.rows[0].id;

    let msg = `*Nouvelle Commande IDPA MAROC*%0A%0A`;
    msg += `Client : ${name}%0A`;
    msg += `Tel : ${phone}%0A`;
    msg += `Ville : ${city}%0A`;
    msg += `Adresse : ${address}%0A%0A*Détails :*%0A`;
    items.forEach(i => msg += `• ${i.name} × ${i.quantity} = ${i.price * i.quantity} DH%0A`);
    msg += `%0ATotal : ${total} DH%0A%0ACommande #${orderId}`;

    const whatsappURL = `https://wa.me/212600136539?text=${msg}`;
    res.json({ success: true, orderId, whatsappURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur envoi commande' });
  }
});

// Servir le site
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur IDPA MAROC lancé sur le port ${PORT}`);
});