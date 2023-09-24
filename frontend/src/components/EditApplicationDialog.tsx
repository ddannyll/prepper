import { IconSettings } from "@tabler/icons-react";
import Button from "./ui-kit/Button";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPApplicatonFetcher } from "@/service/applicationFetcher";
import { useRouter } from "next/router";
import BeatLoader from "react-spinners/BeatLoader";
import { DbInnerApplication } from "@/service/swagger/Api";
import toast from "react-hot-toast";

interface EditApplciationDialogProps {
  name?: string;
  id: string;
}

const applicationFetcher = new HTTPApplicatonFetcher();
export default function EditApplicationDialog({
  name,
  id,
}: EditApplciationDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => applicationFetcher.deleteApplication(id),
    onMutate: async () => {
      const prevApplicaitons = queryClient.getQueryData<string[]>([
        "applications",
      ]);
      console.log(prevApplicaitons);
      queryClient.setQueryData<DbInnerApplication[]>(["applications"], (old) =>
        [...(old || [])].filter((app) => app.id !== id)
      );
      router.push("/applications");
      return { prevApplicaitons };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => {
      toast.error(`Failed to delete application ${id}`);
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="tertiary">
          <IconSettings className="" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Editing Application</DialogDescription>
        </DialogHeader>
        <Label>Application Name</Label>
        <Input />
        <div className="flex justify-between">
          <Button variant="danger" onClick={() => mutate()}>
            {isLoading ? <BeatLoader color="white" /> : "Delete Application"}
          </Button>
          <Button>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
