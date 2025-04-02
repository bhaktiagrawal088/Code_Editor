import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel'
import { SignInButton, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { MessageSquare } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Comment from './Comment';
import CommentForm from './CommentForm';

function Comments({snippetId} : {snippetId : Id<"snippets">}) {

    const  {user} = useUser();
    const[isSubmitting, setIsSubmitting]  = useState(false);
    const [ deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

    const comments = useQuery(api.snippets.getComments, {snippetId}) || [];
    console.log("Fetched comments:", comments); // Debugging log

    const addComment = useMutation(api.snippets.addComments);
    const deleteComment = useMutation(api.snippets.deleteComment);

    const handleSubmitComment = async(content : string) => {
        setIsSubmitting(true);

        try {
            await addComment({snippetId, content})
            await new Promise((resolve) => setTimeout(resolve, 500)); // Short delay for sync
            // comments?.refresh(); // Manually trigger a refresh
        } catch (error) {
            console.log("Error adding comment : ", error);
            toast.error("Something went wrong")
        }
        finally{
            setIsSubmitting(false);
        }
    }

    const handleDeleteComment = async(commentId : Id<"snippetComments">) => {
        setDeletingCommentId(commentId);

        try {
           await deleteComment({commentId}) ;
        } catch (error) {
            console.log("Error deleting comment:", error);
            toast.error("Something went wrong");
        }
        finally{
            setDeletingCommentId(null);
        }

    }


  return (
    <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl overflow-hidden">
          <div className="px-6 sm:px-8 py-6 border-b border-[#ffffff0a]">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Discussion ({comments.length})
            </h2>
      </div>

      <div className='p-6 sm:p-8'> 
        {
            user ? (
                <div>
                    <CommentForm onSubmit={handleSubmitComment} isSubmitting={isSubmitting}/>
                </div>
            ) : (
                <div className="bg-[#0a0a0f] rounded-xl p-6 text-center mb-8 border border-[#ffffff0a]">
                    <p className='text-[#808086] mb-4'>Sign in to join the discussionc</p>
                    <SignInButton mode='modal'>
                        <button className='px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] 
                        transition-colors'>
                            Sign In
                        </button>
                    </SignInButton>
                </div>
            )
        }

        <div className='space-y-6'>
            { comments && comments.length > 0 ? (
            comments.map((comment) => (
                <Comment
                key={comment._id}
                comment={comment}
                onDelete={handleDeleteComment}
                isDeleting={deletingCommentId === comment._id}
                currentUserId={user?.id ?? ""}
                />
        )) ) : (
            <p>No comment yet</p>
        )}
        </div>

      </div>
    </div>
  )
}

export default Comments
