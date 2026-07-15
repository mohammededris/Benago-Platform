import { UserButton } from "@clerk/react";
export function NotRegistered() {
  return (
    <>
      <div
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: {
                width: "50px",
                height: "50px",
                borderRadius: "10px",
              },
            },
          }}
        />
        <div className="not-registered-container">
          <h1>Not Registered</h1>
          <p>
            You are not registered to access this page. Please contact the
            administrator for access.
          </p>
          <a
            aria-label="Chat on WhatsApp"
            href="https://wa.me/201288830792?text=Hi"
          >
            {" "}
            <img alt="Chat on WhatsApp" src="./WhatsAppButtonGreenLarge.svg" />
          </a>
        </div>
      </div>
    </>
  );
}
