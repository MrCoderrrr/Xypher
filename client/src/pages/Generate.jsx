import { useEffect, useMemo, useState } from "react";
import { Copy, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import api from "../utils/axios";
import { promptView } from "../utils/shape";
import { useAuth } from "../context/AuthContext";

function Generate() {
  const { id } = useParams();
  const { refetchUser } = useAuth();
  const { data: promptData, isLoading } = useQuery({
    queryKey: ["prompt", id],
    queryFn: async () => (await api.get(`/prompts/${id}`)).data,
    enabled: Boolean(id),
  });
  const prompt = promptData?.prompt ? promptView(promptData.prompt) : null;
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [output, setOutput] = useState("");
  const cost = prompt ? Math.max(1, Math.ceil(prompt.price * 0.1)) : 0;

  const generatedPreview = useMemo(() => {
    if (!prompt?.promptContent) return "";
    return prompt.promptContent.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => values[key] || `[${key}]`);
  }, [prompt?.promptContent, values]);

  useEffect(() => {
    if (!prompt) return;
    setValues(Object.fromEntries((prompt.variables || []).map((variable) => [variable.name, ""])));
  }, [prompt]);

  const runMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/generation/run", payload)).data,
    onSuccess: async (data) => {
      setOutput(data.output || "");
      await refetchUser();
      toast.success("Generation completed");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Generation failed");
    },
  });

  const run = () => {
    if (!prompt) return;
    const nextErrors = {};
    prompt.variables.forEach((variable) => {
      if (!values[variable.name]?.trim()) nextErrors[variable.name] = `${variable.label} required`;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    runMutation.mutate({ promptId: prompt.id, variables: values });
  };

  if (isLoading) {
    return <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 text-text-muted">Loading prompt...</section>;
  }
  if (!prompt) {
    return <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 text-danger">Prompt not found.</section>;
  }

  return (
    <section className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-bg-card p-6 shadow-card">
        <p className="text-base font-bold text-cyan">Run prompt</p>
        <h1 className="mt-2 font-heading text-4xl font-black">{prompt.title}</h1>
        <p className="mt-3 text-lg text-text-muted">{prompt.description}</p>
        <div className="mt-6 space-y-4">
          {prompt.variables.map((variable) => (
            <div key={variable.name}>
              <label className="text-base font-bold text-text-muted" htmlFor={variable.name}>{variable.label}</label>
              <input id={variable.name} value={values[variable.name]} onChange={(event) => setValues((current) => ({ ...current, [variable.name]: event.target.value }))} placeholder={variable.placeholder} className={`mt-2 w-full rounded-md border bg-bg-secondary px-4 py-3 outline-none placeholder:text-text-muted focus:border-cyan ${errors[variable.name] ? "border-danger" : "border-border"}`} />
              {errors[variable.name] && <p className="mt-1 text-sm text-danger">{errors[variable.name]}</p>}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-cyan/25 bg-cyan/10 p-4 text-base font-bold text-cyan">This generation costs {cost} tokens</div>
        <Button className="mt-6 w-full" size="lg" loading={runMutation.isPending} onClick={run}>
          {runMutation.isPending ? "Generating..." : "Run Generation"}
        </Button>
      </div>

      <div className="rounded-md border border-border bg-bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-3xl font-bold">Your Output</h2>
          {output && <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(output)}><Copy size={15} /> Copy</Button>}
        </div>
        {output ? (
          <div className="mt-6 animate-fade-in rounded-md border border-border bg-bg-secondary p-5 font-mono text-sm leading-7 text-cyan">{output}</div>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Sparkles}
              title="Your output will appear here"
              message={generatedPreview ? "Fill variables and run generation on server." : "Fill the prompt variables and run a generation."}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default Generate;
