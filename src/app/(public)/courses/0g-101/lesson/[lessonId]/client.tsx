'use client';

import React, { useState, useEffect } from 'react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { ArrowLeft, ArrowRight, Clock, Play, FileText, Code, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const modules = [
  {
    id: 1,
    type: 'video',
    title: 'Introduction to 0G',
    duration: '15 min',
    videoUrl: 'https://www.youtube.com/embed/l0Jdye-MhVQ',
    description: 'Learn what makes 0G the first AI-native blockchain and how it solves critical infrastructure challenges.',
  },
  {
    id: 2,
    type: 'text',
    title: 'Storage Architecture',
    duration: '20 min',
    content: `# Storage Architecture

## The Challenge

AI applications need to store and retrieve massive amounts of data - training datasets, model weights, embeddings, and more. Traditional blockchain storage is prohibitively expensive and slow.

## 0G's Approach

0G separates **data availability** from **data storage**:

**Data Availability**: What data exists and where to find it (on-chain)
**Data Storage**: The actual data content (off-chain, but verifiable)

## Architecture Components

**Storage Nodes**: Hold the actual data chunks
**Indexing Network**: Maintains data location and availability proofs
**Retrieval Protocol**: Efficiently fetches data when needed

## Cryptographic Guarantees

Even though data lives off-chain, you get blockchain-level security:
- **Merkle proofs** verify data integrity
- **Erasure coding** ensures availability even if nodes go offline
- **Cryptographic commitments** prove data hasn't been tampered with

## Practical Benefits

**Cost**: 1000x cheaper than on-chain storage
**Speed**: Near-instant retrieval for AI workloads
**Scale**: Petabytes of data without blockchain bloat`,
    description: 'Understand how 0G revolutionizes data storage for AI applications.',
  },
  {
    id: 3,
    type: 'text',
    title: 'Compute Network',
    duration: '25 min',
    content: `# Compute Network

## GPU Infrastructure

0G creates a decentralized network of GPU providers, making AI compute accessible and affordable.

## Key Features

**Dynamic Pricing**: Market-driven rates based on supply and demand
**Quality Assurance**: Providers are ranked and verified
**Global Distribution**: Access GPUs worldwide for low latency
**Flexible Scaling**: From single inference to massive training jobs

## Provider Network

**Enterprise Providers**: Data centers with high-end hardware
**Individual Contributors**: Gamers and enthusiasts sharing idle GPUs
**Cloud Integration**: Seamless connection to major cloud providers
**Edge Computing**: Local processing for real-time applications`,
    description: 'Explore the decentralized GPU network powering 0G AI infrastructure.',
  }
];

function renderTextContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      i++;
      continue;
    }

    // Main headings (# )
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0">
          {line.substring(2)}
        </h1>
      );
    }
    // Sub headings (## )
    else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-semibold text-green-300 mb-4 mt-6">
          {line.substring(3)}
        </h2>
      );
    }
    // List items
    else if (line.startsWith('- ')) {
      const listItems: React.ReactNode[] = [];
      let j = i;
      
      while (j < lines.length && lines[j].trim().startsWith('- ')) {
        const listLine = lines[j].trim();
        const itemText = listLine.substring(2);
        
        // Handle bold text in list items
        const formattedText = itemText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        const parts = formattedText.split(/(<strong[^>]*>.*?<\/strong>)/);
        
        listItems.push(
          <li key={j} className="text-slate-300 mb-2 pl-2">
            {parts.map((part, idx) => {
              if (part.includes('<strong')) {
                const match = part.match(/<strong[^>]*>(.*?)<\/strong>/);
                return match ? <strong key={idx} className="text-white font-semibold">{match[1]}</strong> : part;
              }
              return part;
            })}
          </li>
        );
        j++;
      }
      
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-2 ml-4 mb-6">
          {listItems}
        </ul>
      );
      i = j - 1;
    }
    // Bold text paragraphs
    else if (line.includes('**')) {
      const formattedText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      const parts = formattedText.split(/(<strong[^>]*>.*?<\/strong>)/);
      
      elements.push(
        <p key={i} className="text-slate-300 mb-4 leading-relaxed">
          {parts.map((part, idx) => {
            if (part.includes('<strong')) {
              const match = part.match(/<strong[^>]*>(.*?)<\/strong>/);
              return match ? <strong key={idx} className="text-white font-semibold">{match[1]}</strong> : part;
            }
            return part;
          })}
        </p>
      );
    }
    // Regular paragraphs
    else {
      elements.push(
        <p key={i} className="text-slate-300 mb-4 leading-relaxed">
          {line}
        </p>
      );
    }
    
    i++;
  }

  return elements;
}

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ZeroGLessonClient({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const moduleId = parseInt(lessonId);
  const currentModule = modules.find(m => m.id === moduleId);
  const { completedModules, completionCount, markModuleComplete } = useCourseProgress('0g-101', modules.length);

  // progress state is managed by useCourseProgress hook

  const finishCourseBackend = async () => {
    try {
      const res = await fetch('/api/user/course/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: '0g-101' })
      });
      if (res.ok) toast.success('Course completed! 🎉');
      try { router.refresh(); } catch (e) {}
    } catch (err) {
      // finish course API error — silently handled
    }
  };

  const markAsCompleted = () => {
    if (completedModules.has(moduleId)) return;
    markModuleComplete(moduleId);

    const newCount = completionCount + 1;
    if (newCount === modules.length) {
      finishCourseBackend();
    } else {
      try {
        fetch('/api/user/course/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseSlug: '0g-101', completedCount: newCount, totalModules: modules.length })
        });
      } catch (err) { /* ignore */ }
    }
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Button asChild>
            <a href="/courses/0g-101">Back to Course</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          asChild
          className="mb-6 text-green-400 hover:text-green-300" 
        >
          <a href="/courses/0g-101">
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Back to Course
          </a>
        </Button>

        <Card className="mb-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white mb-4">{currentModule.title}</CardTitle>
            <div className="flex items-center gap-4 mb-4">
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${
                currentModule.type === 'video' ? 'border-green-400/40 text-green-300' :
                currentModule.type === 'code' ? 'border-green-400/40 text-green-300' :
                'border-green-400/40 text-green-300'
              }`}>
                {currentModule.type === 'video' && <Play className="inline h-3 w-3 mr-1" />}
                {currentModule.type === 'code' && <Code className="inline h-3 w-3 mr-1" />}
                {currentModule.type === 'text' && <FileText className="inline h-3 w-3 mr-1" />}
                {currentModule.type.charAt(0).toUpperCase() + currentModule.type.slice(1)}
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="h-4 w-4" />
                <span>{currentModule.duration}</span>
              </div>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed">{currentModule.description}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Video Content */}
            {currentModule.type === 'video' && currentModule.videoUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-800">
                <iframe
                  src={currentModule.videoUrl}
                  title={currentModule.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {/* Text Content */}
            {currentModule.type === 'text' && currentModule.content && (
              <div className="prose prose-invert max-w-none">
                {renderTextContent(currentModule.content)}
              </div>
            )}

            {/* Completion indicator (progress managed by hook) */}
            <div className="flex justify-center pt-8">
              {completedModules.has(moduleId) ? (
                <div className="px-8 py-3 text-lg bg-green-600 text-white rounded-lg">
                  <CheckCircle className="mr-2 h-5 w-5 inline" /> Completed
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {moduleId > 1 ? (
            <Button variant="outline" asChild className="border-green-400/40 text-green-300 hover:bg-green-400/10">
              <a href={`/courses/0g-101/lesson/${moduleId - 1}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Module
              </a>
            </Button>
          ) : (
            <div></div>
          )}
          
          {moduleId < modules.length ? (
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={async () => {
                if (!completedModules.has(moduleId)) markAsCompleted();
                window.location.href = `/courses/0g-101/lesson/${moduleId + 1}`;
              }}
            >
              Next Module
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}