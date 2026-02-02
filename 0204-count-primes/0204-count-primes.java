import java.util.Scanner;

public class Solution {
    public static int countPrimes(int n) {
        if (n < 2) return 0;

        boolean[] isPrime = new boolean[n];
        for (int i = 2; i < n; i++) {
            isPrime[i] = true;
        }

        for (int i = 2; i * i < n; i++) {
            if (isPrime[i]) {
                for (int j = i * i; j < n; j += i) {
                    isPrime[j] = false;
                }
            }
        }

        int count = 0;
        for (boolean prime : isPrime) {
            if (prime) count++;
        }

        return count;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("n= ");
        int n = scanner.nextInt();
        System.out.println( n  + countPrimes(n));
        scanner.close();
    }
}
