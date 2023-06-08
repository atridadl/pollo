import * as React from "react";

interface EmailTemplateProps {
  name: string;
}

export const Goodbye: React.FC<Readonly<EmailTemplateProps>> = ({ name }) => (
  <div>
    <h1>Welcome, {name}!</h1>
    <p>We're sorry to see you go!</p>
    <p>
      Your data has been deleted, including all room history, user data, votes,
      etc.
    </p>
    <br />
    <p>Sprint Padawan Admin - Atridad</p>
  </div>
);
