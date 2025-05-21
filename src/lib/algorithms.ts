import { Track, User, Post } from './types';

// Merge Sort Implementation (Divide and Conquer)
// Time Complexity: O(n log n)
export function mergeSort<T>(arr: T[], compareFunc: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    return merge(
        mergeSort(left, compareFunc),
        mergeSort(right, compareFunc),
        compareFunc
    );
}

function merge<T>(left: T[], right: T[], compareFunc: (a: T, b: T) => number): T[] {
    const result: T[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (compareFunc(left[leftIndex], right[rightIndex]) <= 0) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }

    return result.concat(left.slice(leftIndex), right.slice(rightIndex));
}

// Dynamic Programming for Content Recommendation
// Uses memoization to optimize repeated calculations
// Time Complexity: O(n * m) where n is number of users and m is number of content items
export function recommendContent(
    user: User,
    tracks: Track[],
    memoTable: Map<string, number> = new Map()
): Track[] {
    const scores: { track: Track; score: number }[] = [];

    for (const track of tracks) {
        const key = `${user.id}-${track.id}`;
        let score = memoTable.get(key);

        if (score === undefined) {
            // Calculate score based on user preferences and track attributes
            score = calculateRecommendationScore(user, track);
            memoTable.set(key, score);
        }

        scores.push({ track, score });
    }

    // Sort by score in descending order
    return scores
        .sort((a, b) => b.score - a.score)
        .map(item => item.track);
}

function calculateRecommendationScore(user: User, track: Track): number {
    // Weighted scoring based on multiple factors
    const weights = {
        genreMatch: 0.4,
        artistFollowing: 0.3,
        popularity: 0.2,
        recency: 0.1
    };

    const genreScore = 0.5; // Placeholder for genre matching logic
    const artistScore = user.following > 1000 ? 1 : user.following / 1000;
    const popularityScore = (track.plays + track.likes * 2) / 100000;
    const recencyScore = calculateRecencyScore(track.createdAt);

    return (
        genreScore * weights.genreMatch +
        artistScore * weights.artistFollowing +
        popularityScore * weights.popularity +
        recencyScore * weights.recency
    );
}

// Greedy Algorithm for User Engagement Scoring
// Time Complexity: O(n) where n is the number of activities
export function calculateUserEngagementScore(user: User, posts: Post[]): number {
    // Define weights for different engagement factors
    const weights = {
        followers: 0.3,
        posts: 0.2,
        comments: 0.15,
        likes: 0.15,
        shares: 0.1,
        profileCompleteness: 0.1
    };

    // Calculate individual scores using greedy approach
    const followerScore = normalizeScore(user.followers, 10000);
    const postScore = normalizeScore(posts.length, 100);
    const commentScore = normalizeScore(
        posts.reduce((sum, post) => sum + post.comments, 0),
        1000
    );
    const likeScore = normalizeScore(
        posts.reduce((sum, post) => sum + post.likes, 0),
        5000
    );
    const profileScore = calculateProfileCompleteness(user);

    // Combine scores using weights
    return (
        followerScore * weights.followers +
        postScore * weights.posts +
        commentScore * weights.comments +
        likeScore * weights.likes +
        profileScore * weights.profileCompleteness
    );
}

// Backtracking Algorithm for Playlist Generation
// Time Complexity: O(2^n) in worst case
export function generateOptimalPlaylist(
    tracks: Track[],
    targetDuration: number,
    maxTracks: number
): Track[] {
    const result: Track[] = [];
    const bestPlaylist: Track[] = [];
    let bestScore = 0;

    function backtrack(
        currentTracks: Track[],
        remainingDuration: number,
        currentIndex: number,
        score: number
    ) {
        // Base cases
        if (currentTracks.length === maxTracks || currentIndex === tracks.length) {
            if (score > bestScore) {
                bestScore = score;
                bestPlaylist.length = 0;
                bestPlaylist.push(...currentTracks);
            }
            return;
        }

        // Try including current track
        const currentTrack = tracks[currentIndex];
        if (
            remainingDuration >= currentTrack.duration &&
            currentTracks.length < maxTracks
        ) {
            currentTracks.push(currentTrack);
            backtrack(
                currentTracks,
                remainingDuration - currentTrack.duration,
                currentIndex + 1,
                score + calculateTrackScore(currentTrack)
            );
            currentTracks.pop();
        }

        // Try skipping current track
        backtrack(currentTracks, remainingDuration, currentIndex + 1, score);
    }

    backtrack(result, targetDuration, 0, 0);
    return bestPlaylist;
}

// Helper Functions
function normalizeScore(value: number, maxValue: number): number {
    return Math.min(value / maxValue, 1);
}

function calculateRecencyScore(createdAt: string): number {
    const ageInDays =
        (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - ageInDays / 30); // Linear decay over 30 days
}

function calculateProfileCompleteness(user: User): number {
    const fields = ['displayName', 'avatar', 'bio', 'walletAddress'];
    const completedFields = fields.filter(field => Boolean(user[field])).length;
    return completedFields / fields.length;
}

function calculateTrackScore(track: Track): number {
    const playsWeight = 0.4;
    const likesWeight = 0.4;
    const commentsWeight = 0.2;

    return (
        normalizeScore(track.plays, 100000) * playsWeight +
        normalizeScore(track.likes, 10000) * likesWeight +
        normalizeScore(track.comments, 1000) * commentsWeight
    );
} 