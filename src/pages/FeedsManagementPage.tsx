import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Video, Trash2, PlayCircle, StopCircle, Settings } from 'lucide-react';

const FeedsManagementPage = () => {
  const [feeds, setFeeds] = useState([
    { id: 1, name: 'Entrance Camera', url: 'rtsp://192.168.1.10:554', status: 'active', vehicles: 45 },
    { id: 2, name: 'Parking Lot A', url: 'rtsp://192.168.1.11:554', status: 'active', vehicles: 23 },
    { id: 3, name: 'Exit Gate', url: 'rtsp://192.168.1.12:554', status: 'paused', vehicles: 12 },
    { id: 4, name: 'Highway Cam 1', url: 'rtsp://192.168.1.13:554', status: 'active', vehicles: 78 },
  ]);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Feeds Management</h1>
        <p className="text-muted-foreground">
          Manage multiple video surveillance feeds for real-time vehicle detection and monitoring
        </p>
      </div>

      {/* Add New Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Feed</CardTitle>
          <CardDescription>Connect a new video stream for vehicle monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Feed name" className="flex-1" />
            <Input placeholder="RTSP URL (rtsp://...)" className="flex-1" />
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Feed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Feeds Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {feeds.map((feed) => (
          <Card key={feed.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{feed.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{feed.url}</CardDescription>
                </div>
                <Badge variant={feed.status === 'active' ? 'default' : 'secondary'}>
                  {feed.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Preview Placeholder */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Video className="w-12 h-12 text-muted-foreground" />
              </div>

              {/* Feed Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Vehicles Detected</div>
                  <div className="text-2xl font-bold">{feed.vehicles}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">FPS</div>
                  <div className="text-2xl font-bold">30</div>
                </div>
              </div>

              {/* Feed Controls */}
              <div className="flex gap-2">
                {feed.status === 'active' ? (
                  <Button variant="outline" size="sm" className="flex-1">
                    <StopCircle className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{feeds.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Active streams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {feeds.reduce((acc, f) => acc + f.vehicles, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Detected today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">45ms</div>
            <p className="text-sm text-muted-foreground mt-1">Per frame</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">67%</div>
            <p className="text-sm text-muted-foreground mt-1">GPU utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Feed Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Configuration</CardTitle>
          <CardDescription>Supported video stream protocols and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Supported Protocols:</h4>
            <div className="flex flex-wrap gap-2">
              {['RTSP', 'HTTP', 'RTMP', 'HLS', 'WebRTC'].map(protocol => (
                <Badge key={protocol} variant="outline">{protocol}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Recommended Settings:</h4>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div><span className="font-medium">Resolution:</span> 1920x1080 or 1280x720</div>
              <div><span className="font-medium">Frame Rate:</span> 25-30 FPS</div>
              <div><span className="font-medium">Codec:</span> H.264 / H.265</div>
              <div><span className="font-medium">Bitrate:</span> 2-4 Mbps</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedsManagementPage;
