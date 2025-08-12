import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ServerDebugPanelProps {
  apiBase?: string;
}

export function ServerDebugPanel({ apiBase = `https://${projectId}.supabase.co/functions/v1/server` }: ServerDebugPanelProps) {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const testEndpoint = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    const startTime = Date.now();
    try {
      const url = `${apiBase}/${endpoint}`;
      console.log(`Testing ${method} ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        ...(body && { body: JSON.stringify(body) })
      });

      const responseTime = Date.now() - startTime;
      const responseText = await response.text();
      
      let parsedResponse;
      let isJson = true;
      
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        parsedResponse = responseText;
        isJson = false;
      }

      return {
        endpoint,
        method,
        status: response.status,
        ok: response.ok,
        isJson,
        responseTime,
        response: parsedResponse,
        error: null
      };
    } catch (error) {
      return {
        endpoint,
        method,
        status: 0,
        ok: false,
        isJson: false,
        responseTime: Date.now() - startTime,
        response: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runTests = async () => {
    setStatus('testing');
    setResults([]);

    const tests = [
      { endpoint: 'health', method: 'GET' as const },
      { endpoint: 'bulk-accounts', method: 'GET' as const },
      { endpoint: 'work-tickets', method: 'GET' as const },
      { endpoint: 'vehicles', method: 'GET' as const },
      { endpoint: 'drivers', method: 'GET' as const },
    ];

    const testResults = [];
    
    for (const test of tests) {
      const result = await testEndpoint(test.endpoint, test.method);
      testResults.push(result);
    }

    setResults(testResults);
    
    const allSuccessful = testResults.every(r => r.ok || (r.status === 404 && r.isJson));
    setStatus(allSuccessful ? 'success' : 'error');
  };

  const getStatusBadge = (result: any) => {
    if (result.error) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Network Error</Badge>;
    } else if (result.ok) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    } else if (result.isJson) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />API Error</Badge>;
    } else {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />404 HTML</Badge>;
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Debug Server
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 shadow-lg border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Server Connection Debug</CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={runTests}
              disabled={status === 'testing'}
              className="h-7 px-2"
            >
              {status === 'testing' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsVisible(false)}
              className="h-7 w-7 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs">
          <div className="break-all">
            <strong>API Base:</strong> {apiBase}
          </div>
          
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="font-medium">Test Results:</div>
              {results.map((result, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono">{result.method} /{result.endpoint}</span>
                    {getStatusBadge(result)}
                  </div>
                  
                  <div className="text-gray-600">
                    Status: {result.status} | Time: {result.responseTime}ms
                  </div>
                  
                  {result.error && (
                    <div className="text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {!result.isJson && result.response && (
                    <div className="text-orange-600 mt-1">
                      Non-JSON Response: {typeof result.response === 'string' ? result.response.substring(0, 100) : 'Binary data'}
                    </div>
                  )}
                  
                  {result.isJson && result.response && (
                    <div className="text-green-600 mt-1">
                      JSON Response: {typeof result.response === 'object' ? JSON.stringify(result.response).substring(0, 100) : result.response.substring(0, 100)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {status === 'idle' && (
            <div className="text-gray-500">Click "Test" to check server endpoints</div>
          )}
          
          {status === 'testing' && (
            <div className="text-blue-600">Testing endpoints...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}