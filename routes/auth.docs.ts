/**
 * @swagger
 * /api/auth/sign-up/email:
 *   post:
 *     summary: Create a new admin account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, example: "admin@company.com" }
 *               password: { type: string, example: "RMuIM432q8f5QR84ukMXaw==" }
 *               name: { type: string, example: "Admin User" }
 *               companyName: { type: string, example: "Company Name" }
 *     responses:
 *       200:
 *         description: Success. Project created and user logged in.
 */

/**
 * @swagger
 * /api/auth/sign-in/email:
 *   post:
 *     summary: Log in to an existing account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@company.com" }
 *               password: { type: string, example: "RMuIM432q8f5QR84ukMXaw==" }
 *     responses:
 *       200:
 *         description: Success. Sets the session cookie.
 */

/**
 * @swagger
 * /api/auth/sign-out:
 *   post:
 *     summary: Log out and clear session
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Success. Cookie cleared.
 */
