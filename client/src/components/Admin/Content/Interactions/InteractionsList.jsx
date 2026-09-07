import React from 'react';
import { Activity, Calendar, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  getInteractionIcon,
  getInteractionText,
  formatTime,
} from './InteractionsUtils.jsx';

export default function InteractionsList({ interactions, loading }) {
  if (loading && interactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size={32} className="animate-spin text-text-tertiary mb-4" />
        <p className="text-text-secondary font-medium">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <Empty className="border-none py-20 h-full">
        <EmptyMedia variant="icon" className="!size-16 !bg-surface-secondary">
          <Activity className="!size-8 !text-text-tertiary" />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-semibold text-content mb-0">
          Chưa có tương tác nào
        </EmptyTitle>
        <EmptyDescription className="max-w-xs text-text-secondary">
          Không tìm thấy hoạt động tương tác nào phù hợp với bộ lọc hiện tại.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">

      {interactions.map(interaction => (
        <div
          key={interaction._id}
          className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl hover:bg-surface transition-colors"
        >

          {/* User Avatar with Action Icon */}
          <div className="relative shrink-0">
            <img
              src={
                interaction.user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  interaction.user?.name || 'U'
                )}&background=random`
              }
              alt={interaction.user?.name || 'User'}
              className="w-12 h-12 rounded-full object-cover bg-surface-secondary"
            />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-surface-secondary">
              {getInteractionIcon(interaction.type)}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center flex-wrap gap-1.5 text-sm">
                <span className="font-bold text-content cursor-pointer hover:underline">
                  {interaction.user?.name || 'Người dùng'}
                </span>
                <span className="text-text-tertiary text-xs font-medium">
                  @{interaction.user?.username || 'unknown'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>{getInteractionText(interaction.type)}</span>
                {interaction.target?.type === 'user' ? (
                  <>
                    <ArrowRight size={12} className="text-text-tertiary" />
                    <span className="font-bold text-content">
                      {interaction.target.name}
                    </span>
                  </>
                ) : interaction.target ? (
                  <>
                    <ArrowRight size={12} className="text-text-tertiary" />
                    <span>bài viết của</span>
                    <span className="font-bold text-content">
                      {interaction.target.author}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Content Preview */}
            {(interaction.content || interaction.target?.preview) && (
              <div className="p-4 bg-surface-secondary rounded-2xl mb-3">
                {interaction.target?.preview && (
                  <div className="text-[10px] bg-surface text-text-tertiary font-bold px-2 py-0.5 rounded-full inline-block mb-2">
                    PREVIEW
                  </div>
                )}
                <p className="text-sm text-text-secondary italic font-medium line-clamp-2">
                  "{interaction.content || interaction.target?.preview}"
                </p>
              </div>
            )}

            {/* Footer: Meta Info */}
            <div className="flex items-center gap-4 text-xs font-bold text-text-tertiary mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{formatTime(interaction.createdAt)}</span>
              </div>

              {interaction.sentiment && (
                <Badge
                  className={
                    interaction.sentiment === 'positive'
                      ? 'bg-success/10 text-success'
                      : interaction.sentiment === 'negative'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-surface-secondary text-text-tertiary'
                  }
                >
                  {interaction.sentiment === 'positive'
                    ? 'Tích cực'
                    : interaction.sentiment === 'negative'
                    ? 'Tiêu cực'
                    : 'Trung lập'}
                </Badge>
              )}

              {interaction.weight !== undefined && (
                <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Activity size={12} className="text-text-tertiary" />
                  <span className="text-text-tertiary">
                    AI Score: {interaction.weight}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
