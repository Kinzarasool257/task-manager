import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createWorkspace } from "../lib/api";

export default function CreateWorkspaceDialog({ open, userId, onWorkspaceCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createWorkspace(name, userId);
      if (result.success) {
        onWorkspaceCreated(result.workspace);
      }
    } catch (err) {
      setError("Failed to create workspace. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create Your First Workspace</DialogTitle>
          <DialogDescription>
            Workspaces are where your team manages projects and tasks. Give yours a name to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="col-span-3"
                disabled={loading}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
