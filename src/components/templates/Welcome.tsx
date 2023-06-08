import * as React from "react";

interface EmailTemplateProps {
  name: string;
}

export const Welcome: React.FC<Readonly<EmailTemplateProps>> = ({ name }) => (
  <div>
    <h1>Welcome, {name}!</h1>
    <p>Thank you for signing up for Sprint Padawan!</p>
    <p>
      If at any point you encounter issues, please let me know at
      support@sprintpadawan.dev.
    </p>
    <br />
    <p>Sprint Padawan Admin - Atridad</p>
  </div>
);
