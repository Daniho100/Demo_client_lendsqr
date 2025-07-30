import axios from 'axios';

export async function checkKarmaBlacklist(email: string): Promise<boolean> {
  console.log(`Checking karma blacklist for: ${email}`);
  try {
    const response = await axios.get(
      `${process.env.ADJUTOR_API_URL}/${email}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ADJUTOR_API_KEY}`,
        },
      }
    );
    console.log(`Karma API response for ${email}:`, response.data);
    
    const { data } = response.data;
    const isBlacklisted = data.reason !== null || parseFloat(data.amount_in_contention) > 0;
    console.log(`Blacklist check for ${email}: ${isBlacklisted}`);
    return isBlacklisted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Karma blacklist check failed:', errorMessage);
    // Fail-safe: assume blacklisted if API fails to avoid onboarding risky users
    return true;
  }
}