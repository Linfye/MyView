"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ArchiveExportButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);

    const response = await fetch("/api/archive/export");
    if (!response.ok) {
      setLoading(false);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `myview-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <Button type="button" variant="outline" onClick={handleDownload}>
      <Download className="size-4" />
      {loading ? "正在导出..." : "导出 JSON"}
    </Button>
  );
}
