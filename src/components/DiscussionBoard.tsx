'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Heart,
  CheckCircle,
  User,
  Clock,
  Reply,
  MoreHorizontal,
  ThumbsUp,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DiscussionThread {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    badge?: string;
  };
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: DiscussionReply[];
  isAnswered: boolean;
  helpfulCount: number;
  category: 'question' | 'discussion' | 'resource' | 'bug-report';
  tags: string[];
  isLiked?: boolean;
}

interface DiscussionReply {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    isInstructor?: boolean;
  };
  content: string;
  createdAt: Date;
  likes: number;
  isHelpful?: boolean;
  isAcceptedAnswer?: boolean;
  isLiked?: boolean;
}

interface DiscussionBoardProps {
  courseId: string;
  lessonId?: string;
  threads?: DiscussionThread[];
  onNewThread?: (thread: Partial<DiscussionThread>) => void;
}

export default function DiscussionBoard({
  courseId,
  lessonId,
  threads = [],
  onNewThread
}: DiscussionBoardProps) {
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  const [filterCategory, setFilterCategory] = useState<DiscussionThread['category'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    const newThread: Partial<DiscussionThread> = {
      title: newThreadTitle,
      content: newThreadContent,
      category: 'discussion'
    };

    onNewThread?.(newThread);
    setNewThreadTitle('');
    setNewThreadContent('');
    setIsCreating(false);
  };

  const getCategoryColor = (category: DiscussionThread['category']) => {
    switch (category) {
      case 'question':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      case 'discussion':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'resource':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'bug-report':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getCategoryLabel = (category: DiscussionThread['category']) => {
    switch (category) {
      case 'question':
        return '❓ Question';
      case 'discussion':
        return '💬 Discussion';
      case 'resource':
        return '📚 Resource';
      case 'bug-report':
        return '🐛 Bug Report';
      default:
        return category;
    }
  };

  const filteredThreads = threads.filter(t =>
    filterCategory === 'all' ? true : t.category === filterCategory
  );

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes;
      case 'unanswered':
        return (a.replies.length === 0 ? 0 : 1) - (b.replies.length === 0 ? 0 : 1);
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
            <MessageCircle className="h-6 w-6 text-cyan-400" />
            Lesson Discussion
          </h2>
          <p className="text-slate-400 text-sm">
            {threads.length} {threads.length === 1 ? 'discussion' : 'discussions'}
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </div>

      {/* Create Thread Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Thread Title
                  </label>
                  <input
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="What's your question or topic?"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Details
                  </label>
                  <textarea
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder="Provide more context, code examples, or explain your question..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 h-32 resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateThread}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Thread
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Sort */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex gap-2">
          {(['all', 'question', 'discussion', 'resource', 'bug-report'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterCategory === cat
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? '🌐 All' : getCategoryLabel(cat as any).split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          {(['recent', 'popular', 'unanswered'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                sortBy === sort
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sort === 'recent' && '📅 Recent'}
              {sort === 'popular' && '🔥 Popular'}
              {sort === 'unanswered' && '❓ Unanswered'}
            </button>
          ))}
        </div>
      </div>

      {/* Thread List or Detail View */}
      {selectedThread ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setSelectedThread(null)}
            className="text-slate-400 hover:text-white"
          >
            ← Back to Discussions
          </Button>

          {/* Thread Detail */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex gap-2 mb-3">
                    <Badge className={getCategoryColor(selectedThread.category)}>
                      {getCategoryLabel(selectedThread.category)}
                    </Badge>
                    {selectedThread.isAnswered && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        ✓ Answered
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl text-white">
                    {selectedThread.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Author Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                  {selectedThread.author.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {selectedThread.author.name}
                    {selectedThread.author.badge && (
                      <span className="ml-2 text-lg">{selectedThread.author.badge}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    Level {selectedThread.author.level} • {selectedThread.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Content */}
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedThread.content}
              </p>

              {/* Tags */}
              {selectedThread.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedThread.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{selectedThread.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{selectedThread.replies.length}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{selectedThread.helpfulCount}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Replies ({selectedThread.replies.length})
            </h3>

            <AnimatePresence>
              {selectedThread.replies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-950/40 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {reply.author.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white">{reply.author.name}</p>
                            {reply.author.isInstructor && (
                              <Badge className="bg-cyan-600/30 text-cyan-300 text-xs">
                                Instructor
                              </Badge>
                            )}
                            {reply.isAcceptedAnswer && (
                              <Badge className="bg-emerald-600/30 text-emerald-300 text-xs">
                                ✓ Accepted Answer
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">
                            Level {reply.author.level} • {reply.createdAt.toLocaleDateString()}
                          </p>
                          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {reply.content}
                          </p>
                          <div className="flex gap-3 mt-3 pt-3 border-t border-slate-700">
                            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{reply.likes}</span>
                            </button>
                            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                              <Heart className="h-3 w-3" />
                              Helpful
                            </button>
                            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-400 transition-colors">
                              <Reply className="h-3 w-3" />
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* New Reply Form */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 space-y-4">
              <label className="block text-sm font-medium text-white">
                Your Reply
              </label>
              <textarea
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder="Share your answer or thoughts..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 h-24 resize-none"
              />
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white w-full">
                <Send className="h-4 w-4 mr-2" />
                Post Reply
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Thread List */
        <motion.div className="space-y-3">
          {sortedThreads.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No discussions yet in this category</p>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Start a Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedThreads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  onClick={() => setSelectedThread(thread)}
                  className="bg-slate-900/50 border-slate-700 hover:border-cyan-400/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-400/10"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thread Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(thread.category)}>
                            {getCategoryLabel(thread.category).split(' ')[0]}
                          </Badge>
                          {thread.isAnswered && (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-1 truncate">
                          {thread.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {thread.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{thread.author.name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {thread.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col items-end gap-2 justify-start">
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-cyan-400">
                              {thread.likes}
                            </p>
                            <p className="text-xs text-slate-500">Likes</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-purple-400">
                              {thread.replies.length}
                            </p>
                            <p className="text-xs text-slate-500">Replies</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
