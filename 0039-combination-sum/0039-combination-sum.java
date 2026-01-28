import java.util.*;

class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        List<Integer> currentCombination = new ArrayList<>();
        
        // Sort candidates to optimize the process by stopping early if a candidate exceeds the target
        Arrays.sort(candidates);
        
        // Start the backtracking process
        backtrack(candidates, target, 0, currentCombination, result);
        return result;
    }

    private void backtrack(int[] candidates, int target, int start, List<Integer> currentCombination, List<List<Integer>> result) {
        if (target == 0) {
            // Found a valid combination
            result.add(new ArrayList<>(currentCombination));
            return;
        }
        
        for (int i = start; i < candidates.length; i++) {
            // If the candidate exceeds the remaining target, no need to continue
            if (candidates[i] > target) {
                break;
            }

            // Include candidates[i] and move forward
            currentCombination.add(candidates[i]);
            // Since we can reuse the same number, we pass `i` (not `i + 1`)
            backtrack(candidates, target - candidates[i], i, currentCombination, result);
            // Backtrack and remove the last element
            currentCombination.remove(currentCombination.size() - 1);
        }
    }
}
