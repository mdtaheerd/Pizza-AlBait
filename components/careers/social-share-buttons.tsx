'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Share2, Linkedin, Facebook, MessageCircle, Link2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface SocialShareButtonsProps {
  jobTitle: string
  jobId: string
  department?: string | null
  location?: string | null
}

export function SocialShareButtons({ jobTitle, jobId, department, location }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  
  // Get the base URL - in production this will be the actual domain
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
  
  const jobUrl = `${baseUrl}/careers/${jobId}`
  const shareText = `Check out this job opportunity: ${jobTitle}${department ? ` at ${department}` : ''}${location ? ` in ${location}` : ''}`
  const encodedUrl = encodeURIComponent(jobUrl)
  const encodedText = encodeURIComponent(shareText)

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    wechat: `weixin://dl/posts?url=${encodedUrl}`, // WeChat deep link (may need native app)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    const url = shareLinks[platform]
    if (platform === 'wechat') {
      // For WeChat, copy the link and show instructions
      handleCopyLink()
      toast.info('Link copied! Paste it in WeChat to share.')
      return
    }
    window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Job
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem 
          onClick={() => handleShare('linkedin')}
          className="cursor-pointer gap-3"
        >
          <Linkedin className="h-4 w-4 text-[#0077B5]" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('facebook')}
          className="cursor-pointer gap-3"
        >
          <Facebook className="h-4 w-4 text-[#1877F2]" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('whatsapp')}
          className="cursor-pointer gap-3"
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('wechat')}
          className="cursor-pointer gap-3"
        >
          <svg className="h-4 w-4 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .176-.553C23.155 18.538 24 17.023 24 15.341c0-3.317-3.107-6.483-7.062-6.483zm-1.834 2.88c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.857 0c.536 0 .97.44.97.983a.976.976 0 0 1-.97.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z"/>
          </svg>
          Share on WeChat
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleCopyLink}
          className="cursor-pointer gap-3"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {copied ? 'Link Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
