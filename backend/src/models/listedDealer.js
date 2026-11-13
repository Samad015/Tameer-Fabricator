// Older subscriptions stored only the active flag. Honor any recorded expiry.
module.exports = function listedDealer() {
  return {
    role: 'dealer',
    isVerified: true,
    isProfileComplete: true,
    isSubscribed: true,
    $or: [
      { 'subscriptionDetails.expiresAt': { $exists: false } },
      { 'subscriptionDetails.expiresAt': { $gt: new Date() } }
    ]
  };
};
