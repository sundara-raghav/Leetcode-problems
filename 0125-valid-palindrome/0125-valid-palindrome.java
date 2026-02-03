class Solution {
    public boolean isPalindrome(String s) {
        // Remove non-alphanumeric characters and convert to lowercase
        s = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return isPalindromeHelper(s, 0, s.length() - 1);
    }

    private boolean isPalindromeHelper(String s, int start, int end) {
        // Base case: If pointers cross, it's a palindrome
        if (start >= end) {
            return true;
        }

        // Check if characters at the current positions are equal
        if (s.charAt(start) != s.charAt(end)) {
            return false;
        }

        // Recursive call, moving pointers inward
        return isPalindromeHelper(s, start + 1, end - 1);
    }
}
