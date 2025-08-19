import crypto from "crypto";

export function generateSecurePassword(length = 12): string {
  const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijkmnopqrstuvwxyz";
  const numberChars = "23456789";
  const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";

  let password = "";
  password += getRandomChar(uppercaseChars);
  password += getRandomChar(lowercaseChars);
  password += getRandomChar(numberChars);
  password += getRandomChar(specialChars);

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = password.length; i < length; i++) {
    password += getRandomChar(allChars);
  }

  return shuffleString(password);
}

function getRandomChar(characters: string): string {
  const randomIndex = crypto.randomInt(0, characters.length);
  return characters.charAt(randomIndex);
}

function shuffleString(str: string): string {
  const array = str.split("");

  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array.join("");
}
