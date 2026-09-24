export default ({ env }) => ({
  email: {
    config: {
      // Placeholder provider so local `develop` doesn't crash on send().
      // Swap for a real free-tier transactional provider (e.g. Resend,
      // Brevo) before v0.3 (B-20) — set EMAIL_PROVIDER + its API key env
      // vars and change `provider` below to match.
      provider: env('EMAIL_PROVIDER', 'sendmail'),
      settings: {
        defaultFrom: env('EMAIL_FROM', 'no-reply@moodly.local'),
        defaultReplyTo: env('EMAIL_FROM', 'no-reply@moodly.local'),
      },
    },
  },
});
