import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Shared "admin list page" controller:
 * search (debounced) + pagination + React Query fetch + list/pagination derived.
 *
 * @param {Object}     options
 * @param {Function}   options.queryHook   - React Query hook (useAdminXxx)
 * @param {string}     options.listKey     - Key of the items array in the response
 * @param {Object}     options.params      - Extra static params (filters, ...)
 * @param {number}     options.limit       - Items per page (default 10)
 */
export const useAdminTable = ({ queryHook, listKey, params = {}, limit = 10 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, refetch } = queryHook({
    page: currentPage,
    limit,
    search: debouncedSearch || undefined,
    ...params,
  });

  const list = Array.isArray(data?.[listKey])
    ? data[listKey]
    : Array.isArray(data?.data)
      ? data.data
      : [];
  const totalPages =
    data?.pagination?.totalPages || data?.totalPages || data?.pages || 1;

  const handlePageChange = useCallback(newPage => setCurrentPage(newPage), []);
  const handleRefresh = useCallback(() => refetch(), [refetch]);

  return {
    data,
    list,
    isLoading,
    totalPages,
    refetch,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    handlePageChange,
    handleRefresh,
  };
};