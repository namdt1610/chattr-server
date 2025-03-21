import TokenService from '../services/tokenService';

// Chạy mỗi ngày vào lúc 3 giờ sáng
export const setupTokenCleanup = () => {
  const runCleanup = async () => {
    console.log('Running expired token cleanup job');
    await TokenService.cleanupExpiredTokens();
    console.log('Token cleanup completed');
  };

  // Tính thời gian đến 3 giờ sáng hôm sau
  const now = new Date();
  const nextRun = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    3, 0, 0
  );
  
  const timeUntilNextRun = nextRun.getTime() - now.getTime();
  
  // Chạy lần đầu vào 3 giờ sáng hôm sau
  setTimeout(() => {
    runCleanup();
    // Sau đó chạy mỗi 24 giờ
    setInterval(runCleanup, 24 * 60 * 60 * 1000);
  }, timeUntilNextRun);
};