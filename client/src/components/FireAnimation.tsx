import "../styles/App.css";
export default function FireAnimation() {
  const fireCount = 25;
  const fires = Array.from({ length: fireCount });

  return (
    <div className="fire-background">
      {fires.map((_, i) => {
        const left = (i * (100 / fireCount)) + Math.random() * 5 - 2.5;
        const delay = Math.random() * 5;
        const size = Math.random() * 2 + 2; // 🔥 2rem–4rem
        const duration = 6 + Math.random() * 4; // 6s–10s

        return (
          <div
            key={i}
            className="fire-emoji"
            style={{
              left: `${left}%`,
              bottom: `-40px`, // start below screen
              fontSize: `${size}rem`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            🔥
          </div>
        );
      })}
    </div>
  );
}
