<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shatranj (Chess By TMK)</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f0f2f5;
      color: #333;
      padding: 40px;
      max-width: 900px;
      margin: auto;
      line-height: 1.6;
    }
    h1 {
      font-size: 2.5em;
      color: #2c3e50;
      text-align: center;
    }
    h2 {
      font-size: 1.5em;
      margin-top: 30px;
      color: #34495e;
      border-bottom: 2px solid #ccc;
      padding-bottom: 5px;
    }
    ul, ol {
      padding-left: 20px;
    }
    code, pre {
      background: #fdfdfd;
      color: #2c3e50;
      padding: 10px;
      display: block;
      border-left: 4px solid #3498db;
      margin: 10px 0;
      font-family: monospace;
      border-radius: 5px;
    }
    em {
      color: #888;
    }
    hr {
      margin: 50px 0;
      border: none;
      border-top: 2px dashed #ccc;
    }
    .footer {
      text-align: center;
      font-weight: bold;
      font-size: 1.2em;
      color: #e74c3c;
    }
  </style>
</head>
<body>

  <h1>♟️ Shatranj (Chess By TMK)</h1>
  <p>A real-time two-player chess game built using <strong>Node.js</strong>, <strong>Express</strong>, <strong>Socket.IO</strong>, and <strong>chess.js</strong>.</p>

  <h2>🚀 Features</h2>
  <ul>
    <li>Real-time multiplayer chess</li>
    <li>Role-based (White, Black, Spectator)</li>
    <li>Valid move checks using chess.js</li>
    <li>Game over detection (checkmate/draw)</li>
    <li>Automatic reset when players disconnect</li>
  </ul>

  <h2>🛠️ Tech Stack</h2>
  <ul>
    <li>Node.js</li>
    <li>Express</li>
    <li>Socket.IO</li>
    <li>EJS (for rendering)</li>
    <li>chess.js</li>
  </ul>

  <h2>🔧 How to Run</h2>
  <ol>
    <li>Clone the repo:
      <pre><code>git clone https://github.com/tmk798/chessgame.git
cd chessgame</code></pre>
    </li>
    <li>Install dependencies:
      <pre><code>npm install</code></pre>
    </li>
    <li>Start the server:
      <pre><code>node app.js</code></pre>
    </li>
    <li>Open your browser:
      <pre><code>http://localhost:3000</code></pre>
    </li>
  </ol>

  <hr>

  <p class="footer">👑 Made with ❤️ by TMK</p>

</body>
</html>
