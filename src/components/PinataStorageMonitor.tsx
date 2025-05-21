import { useState, useEffect } from 'react';
import { getPinataUsage, getPinnedContent } from '@/lib/pinataStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, HardDrive, Wifi } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PinataStorageMonitor() {
  const [usage, setUsage] = useState<any>(null);
  const [pinnedContent, setPinnedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get usage statistics
      const usageData = await getPinataUsage();
      setUsage(usageData);
      
      // Get pinned content
      const contentData = await getPinnedContent(page * itemsPerPage, itemsPerPage);
      setPinnedContent(contentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load storage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
        <Button onClick={loadData} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Pins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pins
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.totalPins || 0}</div>
          </CardContent>
        </Card>

        {/* Storage Used */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Storage Used
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.storageUsed.total || '0 B'}</div>
            <div className="text-xs text-muted-foreground">
              Permanent: {usage?.storageUsed.permanent || '0 B'} <br />
              Temporary: {usage?.storageUsed.temporary || '0 B'}
            </div>
          </CardContent>
        </Card>

        {/* Bandwidth Used */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bandwidth Used
            </CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.bandwidthUsed.total || '0 B'}</div>
            <div className="text-xs text-muted-foreground">
              Permanent: {usage?.bandwidthUsed.permanent || '0 B'} <br />
              Temporary: {usage?.bandwidthUsed.temporary || '0 B'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pinned Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Pinned Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pinnedContent?.items.map((item: any) => (
                <TableRow key={item.hash}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.pinned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {Math.ceil((pinnedContent?.total || 0) / itemsPerPage)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!pinnedContent || (page + 1) * itemsPerPage >= pinnedContent.total}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button onClick={loadData}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
} 