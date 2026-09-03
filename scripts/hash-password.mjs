import bcrypt from "bcryptjs";
const pw = process.argv[2];
if (!pw) {
  console.error("Usage: node scripts/hash-password.mjs 'yourpassword'");
  process.exit(1);
}
console.log("ADMIN_PASSWORD_HASH=" + bcrypt.hashSync(pw, 12));
