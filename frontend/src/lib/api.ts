export type EmailValidationRequest = {
    email: string;
    check_smtp?: boolean;
    debug?: boolean;
  };
  
  export type EmailValidationResponse = {
    email: string;
    status: string;
  };
  
  export async function validateEmail(
    payload: EmailValidationRequest
  ): Promise<EmailValidationResponse> {
    try {
      const res = await fetch("http://localhost:8000/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
  
      return await res.json();
    } catch (error) {
      console.error("Validation error:", error);
      throw error;
    }
  }
  