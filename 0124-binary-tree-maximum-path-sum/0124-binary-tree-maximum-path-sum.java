/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    int maxSum = Integer.MIN_VALUE;
    public int maxPath(TreeNode root){
         if(root == null){
            return 0;
        }
    
        int leftSum = Math.max(0, maxPath(root.left));
        int rightSum = Math.max(0, maxPath(root.right));

        maxSum = Math.max(maxSum, leftSum + rightSum + root.val);
        return Math.max(leftSum, rightSum) + root.val;
    }

    public int maxPathSum(TreeNode root) {
       if(root == null){
        return 0;
       }

       int path = maxPath(root);
       return maxSum;
    }
}