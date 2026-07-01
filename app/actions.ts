"use server";

import { JWT } from "google-auth-library";

export type FeedbackFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const PRODUCT_COLUMNS = [
  { id: "french_fry", header: "FRENCH_FRY" },
  { id: "curly_fries", header: "CURLY_FRIES" },
  { id: "cheesy_potato_balls", header: "CHEESY_POTATO_BALLS" },
  { id: "smilies", header: "SMILIES" },
] as const;

function parseRating(value: FormDataEntryValue | null): string {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? String(parsed) : "";
}

async function getSheetsAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Missing Google Sheets credentials");
  }

  const client = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const { access_token: token } = await client.authorize();
  if (!token) {
    throw new Error("Failed to obtain Google Sheets access token");
  }

  return token;
}

async function appendFeedbackRow(row: string[]): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Feedback";

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const token = await getSheetsAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
    sheetName
  )}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sheets API request failed (${response.status}): ${body}`);
  }
}

export async function submitFeedback(
  prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name) {
    return { status: "error", message: "Please enter your name." };
  }
  if (!phone) {
    return { status: "error", message: "Please enter your phone number." };
  }

  const ratings = PRODUCT_COLUMNS.map((product) =>
    parseRating(formData.get(`rating_${product.id}`))
  );

  try {
    await appendFeedbackRow([
      new Date().toISOString(),
      name,
      phone,
      email,
      ...ratings,
    ]);
  } catch (error) {
    console.error("Failed to append feedback to Google Sheets:", error);
    return {
      status: "error",
      message: "Something went wrong submitting your feedback. Please try again.",
    };
  }

  return { status: "success", message: "Thanks for your feedback!" };
}
