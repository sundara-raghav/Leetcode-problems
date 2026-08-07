import java.util.Arrays;

class Solution {
    private long gcd(long a, long b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    public String smallestNumber(String num, long t) {
        // Step 1: Validate prime factors of t
        long tmp = t;
        for (int p : new int[]{2, 3, 5, 7}) {
            while (tmp % p == 0) {
                tmp /= p;
            }
        }
        if (tmp != 1) {
            return "-1";
        }

        int n = num.length();
        int[] s = new int[n];
        for (int i = 0; i < n; i++) {
            s[i] = num.charAt(i) - '0';
        }

        // Locate the first zero position
        int zeroIdx = num.indexOf('0');

        // Step 2: Build the required t array sequentially from the front
        long[] requiredT = new long[n + 1];
        requiredT[0] = t;
        for (int i = 0; i < n; i++) {
            requiredT[i + 1] = requiredT[i] / gcd(requiredT[i], s[i]);
        }

        // If no zero exists and the original string matches, return immediately
        if (zeroIdx == -1 && requiredT[n] == 1) {
            return num;
        }

        // Step 3: Scan backward to adjust digits greedily
        // If there's a zero, we cannot process positions beyond it using the original digits
        int limit = (zeroIdx == -1) ? n - 1 : zeroIdx;

        for (int i = limit; i >= 0; i--) {
            // If we are at the position of the 0, we can start trying from 1.
            // If we are before the 0 position, we must strictly try digits greater than s[i].
            int startDigit = (i == zeroIdx) ? 1 : s[i] + 1;
            
            for (int d = startDigit; d <= 9; d++) {
                long nextT = requiredT[i] / gcd(requiredT[i], d);
                int remSlots = n - 1 - i;
                
                if (canForm(nextT, remSlots)) {
                    s[i] = d;
                    fillSuffix(s, i + 1, n - 1, nextT);
                    StringBuilder sb = new StringBuilder();
                    for (int val : s) sb.append(val);
                    return sb.toString();
                }
            }
        }

        // Step 4: If no same-length modification works, expand length sequentially
        int extraLen = n + 1;
        while (true) {
            if (canForm(t, extraLen)) {
                int[] res = new int[extraLen];
                fillSuffix(res, 0, extraLen - 1, t);
                StringBuilder sb = new StringBuilder();
                for (int val : res) sb.append(val);
                return sb.toString();
            }
            extraLen++;
        }
    }

    // Check if the current required factor t can be composed within the available slots
    private boolean canForm(long reqT, int slots) {
        for (int p : new int[]{9, 8, 7, 6, 5, 4, 3, 2}) {
            while (reqT % p == 0) {
                reqT /= p;
                slots--;
            }
        }
        return reqT == 1 && slots >= 0;
    }

    // Fill the remaining suffix elements optimally with 1s padding the left
    private void fillSuffix(int[] arr, int start, int end, long reqT) {
        int idx = end;
        for (int p : new int[]{9, 8, 7, 6, 5, 4, 3, 2}) {
            while (reqT % p == 0) {
                if (idx >= start) {
                    arr[idx--] = p;
                }
                reqT /= p;
            }
        }
        while (idx >= start) {
            arr[idx--] = 1;
        }
    }
}
