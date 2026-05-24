import mongoose from 'mongoose';

const inlineCommentSchema = new mongoose.Schema(
  {
    line: { type: Number, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String },
    suggestion: { type: String },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['snippet', 'file', 'github'],
      required: true,
    },
    language: { type: String, default: 'javascript' },
    code: { type: String },
    fileName: { type: String },
    githubRepo: { type: String },
    githubPath: { type: String },
    qualityScore: { type: Number, min: 0, max: 100 },
    summary: { type: String },
    markdownReport: { type: String },
    bugs: [{ type: String }],
    securityIssues: [{ type: String }],
    performanceTips: [{ type: String }],
    bestPractices: [{ type: String }],
    refactoringIdeas: [{ type: String }],
    duplicateCode: [{ type: String }],
    complexityAnalysis: { type: String },
    inlineComments: [inlineCommentSchema],
    staticAnalysis: { type: mongoose.Schema.Types.Mixed },
    pineconeId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, createdAt: -1 });
// Text index removed: MongoDB treats a `language` field as text-search locale override,
// which rejects programming languages like "python". Use regex + Pinecone search instead.

export default mongoose.model('Review', reviewSchema);
