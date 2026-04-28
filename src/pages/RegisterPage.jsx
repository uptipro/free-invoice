import ProfileSetup from "../components/ProfileSetup";

export default function RegisterPage({ onRegister }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 12,
          minWidth: 320,
          boxShadow: "0 2px 16px #0002",
        }}
      >
        <ProfileSetup onSave={onRegister} />
      </div>
    </div>
  );
}
