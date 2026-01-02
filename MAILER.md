
# 📑 Alder Creek Digital Mailer Service (Agnostic)

This is a standalone **"Dumb Pipe"** notification service. It handles authentication with Microsoft 365 and delivers HTML emails with or without PDF attachments. It does **not** generate data or PDFs; it only delivers what it is sent.

## 🚀 API Endpoint

`POST /api/send-report`

### 🔒 Security

All requests must include the `secretKey` in the JSON body.

* **Key:** `INTERNAL_MAILER_SECRET` (Found in `.env`)

---

## 📩 Request Schema (JSON)

The service uses **Zod** for validation. Below is the structure required for a successful call.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `secretKey` | `string` | **Yes** | Must match the server's environment variable. |
| `recipientEmail` | `string` | **Yes** | The client's email address. |
| `subject` | `string` | **Yes** | The email subject line. |
| `htmlBody` | `string` | **Yes** | The full HTML content of the email. |
| `attachments` | `array` | No | An array of attachment objects. |

### Attachment Object Structure

```json
{
  "filename": "Report_Dec_2025.pdf",
  "contentType": "application/pdf",
  "content": "BASE64_ENCODED_STRING_HERE"
}

```

---

## 🛠 Usage Examples

### 1. Sending a Monthly Report (With PDF)

```javascript
const response = await fetch('https://your-mailer-url.com/api/send-report', {
  method: 'POST',
  body: JSON.stringify({
    secretKey: process.env.MAILER_SECRET,
    recipientEmail: "client@business.com",
    subject: "Your Monthly Lead Report",
    htmlBody: "<h1>Report Ready</h1><p>Find your ROI details attached.</p>",
    attachments: [{
      filename: "Monthly_Report.pdf",
      contentType: "application/pdf",
      content: "JVBERi0xLjAKMSAwIG9iago..." // Base64 string
    }]
  })
});

```

### 2. Sending a Lead Alert (No Attachment)

```javascript
const response = await fetch('https://your-mailer-url.com/api/send-report', {
  method: 'POST',
  body: JSON.stringify({
    secretKey: process.env.MAILER_SECRET,
    recipientEmail: "agency-owner@me.com",
    subject: "🔥 New High-Value Lead!",
    htmlBody: "<p>Someone just called from the 'Water Heater' ad group.</p>"
  })
});

```

---

## ⚙️ Infrastructure & Maintenance

* **Provider:** Microsoft Graph API (Office 365).
* **Auth Flow:** OAuth 2.0 Client Credentials (Daemon).
* **Sender Address:** Defined by `OFFICE365_SENDER_EMAIL` in `.env`.
* **Limits:** Maximum payload size is **4MB** (Microsoft Graph default).

### Troubleshooting

* **401 Unauthorized:** The `secretKey` in the request doesn't match the server's `.env`.
* **500 Graph API Error:** Usually means the **Azure Client Secret** has expired or the **Admin Consent** was revoked in the Entra ID (Azure) portal.

---

## EXAMPLE REQUEST

curl -X POST https://notifications-aldercreekdigital-com.vercel.app/api/send-report \
-H "Content-Type: application/json" \
-d '{
  "secretKey": "SECRET_KEY",
  "recipientEmail": "email@email.com",
  "subject": "Test: Monthly Report",
  "htmlBody": "<h1>Test Success</h1><p>This is a test email from the mailer service.</p>",
  "attachments": [
    {
      "filename": "TestReport.pdf",
      "contentType": "application/pdf",
      "content": "JVBERi0xLjAKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDAKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDAKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDAKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAwIFREIAooSGVsbG8gV29ybGQhKSBUagogRVQKZW5kc3RyZWFtCmVuZG9iagp0cmFpbGVyCjw8Ci9Sb290IDEgMCBSCj4+CiUlRU9G"
    }
  ]
}'
