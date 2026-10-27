import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings } from '../api/settings'
import { Settings } from '../types'

export const useSettings = () => {
  const queryClient = useQueryClient()
  const query = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  const mutation = useMutation({
    mutationFn: (data: Partial<Settings>) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  return { settings: query.data, isLoading: query.isLoading, error: query.error, update: mutation.mutateAsync, updating: mutation.isPending }
}
