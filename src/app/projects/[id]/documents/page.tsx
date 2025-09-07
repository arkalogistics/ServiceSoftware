"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Table, Tbody, Td, Th, Thead, Tr, Flex, Spacer, Badge, Card, CardBody, CardHeader, SimpleGrid, InputGroup, InputLeftElement, Text, Tooltip, HStack, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Image } from "@chakra-ui/react";
import StatusSelect from "@/src/components/StatusSelect";

type Doc = {
  id: string;
  title: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  totalHours: number;
  comments?: string | null;
};

function formatDate(val?: string | null) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toISOString().slice(0, 10);
  } catch {
    return val;
  }
}

function formatHM(mins: number) {
  const m = Math.max(0, Math.floor(mins));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${String(mm).padStart(2, "0")}`;
}

export default function ProcessPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [locked, setLocked] = useState(true);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [nextCaptureAt, setNextCaptureAt] = useState<number | null>(null);
  const [baseMinutes, setBaseMinutes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const toast = useToast();
  const CAPTURE_MINUTES = 10;
  const [sessionShots, setSessionShots] = useState<string[]>([]);
  const [showShots, setShowShots] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [intervalId, setIntervalId] = useState<any>(null);

  // New row form
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Planning");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [comments, setComments] = useState("");

  async function load() {
    const res = await fetch(`/api/projects/${projectId}/documents`);
    const j = await res.json();
    if (res.ok) setDocs(j.documents);
  }
  useEffect(() => { load(); }, []);

  async function addDoc(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/projects/${projectId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, status, startDate, endDate, totalHours, comments }) });
    if (res.ok) {
      setTitle(""); setStatus("Planning"); setStartDate(""); setEndDate(""); setTotalHours(0); setComments("");
      load();
    }
  }

  async function saveField(id: string, field: keyof Doc, value: any) {
    const body: any = { [field]: value };
    const res = await fetch(`/api/documents/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const j = await res.json();
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...(j.document as Doc) } : d)));
    }
  }

  async function captureFrame(docId: string) {
    try {
      if (!stream) return;
      const video = document.createElement("video");
      video.srcObject = stream as any;
      await video.play().catch(() => {});
      const w = (video as any).videoWidth || 1280;
      const h = (video as any).videoHeight || 720;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, w, h);
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), "image/jpeg", 0.8));
      const fd = new FormData();
      fd.append("file", new File([blob], `screen-${Date.now()}.jpg`, { type: "image/jpeg" }));
      fd.append("subdir", `${projectId}/screens/${docId}`);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await up.json();
      if (up.ok) {
        const sres = await fetch(`/api/documents/${docId}/screenshots`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: j.path, minutes: CAPTURE_MINUTES }) });
        const sj = await sres.json();
        if (sres.ok) {
          setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, totalHours: sj.hours } : d)));
          if (activeDocId === docId) {
            setBaseMinutes(sj.minutes || 0);
            setStartedAt(Date.now());
          }
          notifyCapture(`Se guardó una captura para "${docs.find(x => x.id === docId)?.title || "tarea"}"`);
          setSessionShots((arr) => [j.path as string, ...arr]);
          return sj.minutes as number;
        }
      }
    } catch (e) {
      console.error("capture error", e);
    }
  }

  async function startScreens(docId: string) {
    try {
      await maybeRequestNotifyPermission();
      const s = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      setStream(s);
      setActiveDocId(docId);
      setTracking(true);
      const minutes = await captureFrame(docId); // captura inicial
      setBaseMinutes(minutes || 0);
      setStartedAt(Date.now());
      const id = setInterval(() => {
        captureFrame(docId);
        setNextCaptureAt(Date.now() + CAPTURE_MINUTES * 60 * 1000);
      }, CAPTURE_MINUTES * 60 * 1000);
      setIntervalId(id);
      setNextCaptureAt(Date.now() + CAPTURE_MINUTES * 60 * 1000);
      const tickId = setInterval(() => setTick((x) => x + 1), 30 * 1000);
      // reuse intervalId to clear both? keep only capture id; use window for tick
      (window as any).__tickId = tickId;
    } catch (e) {
      console.error(e);
    }
  }

  function stopScreens(docId?: string) {
    if (intervalId) clearInterval(intervalId);
    if ((window as any).__tickId) clearInterval((window as any).__tickId);
    setIntervalId(null);
    setTracking(false);
    const queryId = docId || activeDocId;
    setActiveDocId(null);
    setNextCaptureAt(null);
    setBaseMinutes(0);
    setStartedAt(null);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    // fetch all screenshots and show modal
    if (queryId) {
      fetch(`/api/documents/${queryId}/screenshots`).then(async (r) => {
        const j = await r.json().catch(() => ({}));
        const list = (j.screenshots || []).map((s: any) => s.imagePath as string);
        setSessionShots(list);
        setShowShots(true);
      }).catch(() => setShowShots(true));
    }
  }

  async function maybeRequestNotifyPermission() {
    try {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {}
  }

  function notifyCapture(msg: string) {
    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Captura guardada", { body: msg, icon: "/favicon.ico" });
      } else {
        toast({ status: "info", title: "Captura guardada", description: msg });
      }
    } catch {
      toast({ status: "info", title: "Captura guardada", description: msg });
    }
  }

  return (
    <Box>
      <Flex align="center" mb={4}>
        <Heading>Proceso del proyecto</Heading>
        <Spacer />
        <Button onClick={() => setLocked((v) => !v)} variant="outline">{locked ? "🔒 Bloqueado" : "🔓 Editando"}</Button>
      </Flex>

      {/* New task bar - styled card */}
      <Card variant="outline" bg="gray.800" borderColor="whiteAlpha.200" mb={6}>
        <CardHeader pb={2}>
          <Text color="gray.100">Agrega una tarea al proceso</Text>
        </CardHeader>
        <CardBody pt={0}>
          <form onSubmit={addDoc}>
            <SimpleGrid columns={{ base: 1, lg: 7 }} spacing={3} alignItems="end">
              <FormControl isRequired>
                <FormLabel color="gray.100">Tarea</FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" color="gray.300">📝</InputLeftElement>
                  <Input pl={8} color="gray.100" _placeholder={{ color: "gray.400" }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="p.ej. Configurar backend" />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.100">Status</FormLabel>
                <StatusSelect value={status} onChange={setStatus} />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.100">Inicio</FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" color="gray.300">📅</InputLeftElement>
                  <Input pl={8} color="gray.100" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.100">Fin</FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" color="gray.300">📅</InputLeftElement>
                  <Input pl={8} color="gray.100" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.100">Horas</FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" color="gray.300">⏱</InputLeftElement>
                  <Input pl={8} color="gray.100" type="number" value={totalHours} onChange={(e) => setTotalHours(parseInt(e.target.value || "0"))} />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.100">Notas</FormLabel>
                <Input size="sm" color="gray.100" _placeholder={{ color: "gray.400" }} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Detalles, links, etc." />
              </FormControl>
              <Button type="submit" colorScheme="blue" size="sm" height="38px">➕ Agregar</Button>
            </SimpleGrid>
          </form>
        </CardBody>
      </Card>

      <Box overflowX="auto" borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.200" display={{ base: "none", md: "block" }}>
      <Table variant="simple" size="md">
        <Thead position="sticky" top={0} zIndex={1} bg="gray.900">
          <Tr>
            <Th>Tarea</Th>
            <Th>Status</Th>
            <Th>Inicio</Th>
            <Th>Fin</Th>
            <Th isNumeric>Horas</Th>
            <Th>Notas</Th>
            <Th>Seguimiento</Th>
          </Tr>
        </Thead>
        <Tbody sx={{ "tr:nth-of-type(even)": { bg: "whiteAlpha.50" } }}>
          {docs.map((d) => (
            <Tr key={d.id} _hover={{ bg: "whiteAlpha.100" }}>
              <InlineCell value={d.title} isLocked={locked} onSave={(v) => saveField(d.id, "title", v)} />
              <InlineCell
                value={d.status}
                isLocked={locked}
                onSave={(v) => saveField(d.id, "status", v)}
                renderView={(val) => <Badge colorScheme={val === "Done" ? "green" : val === "Development" ? "blue" : val === "Review" ? "purple" : "gray"}>{val || "—"}</Badge>}
                editor={(val, commit) => (
                  <Box>
                    <StatusSelect value={val} onChange={commit} />
                  </Box>
                )}
              />
              <InlineCell value={formatDate(d.startDate)} isLocked={locked} onSave={(v) => saveField(d.id, "startDate", v)} type="date" />
              <InlineCell value={formatDate(d.endDate)} isLocked={locked} onSave={(v) => saveField(d.id, "endDate", v)} type="date" />
              <Td isNumeric>
                {formatHM(activeDocId === d.id && tracking ? (baseMinutes + Math.floor(((Date.now() - (startedAt || Date.now())) / 60000))) : d.totalHours * 60)}
              </Td>
              <InlineCell value={d.comments || ""} isLocked={locked} onSave={(v) => saveField(d.id, "comments", v)} />
              <Td>
                {activeDocId === d.id && tracking ? (
                  <HStack>
                    <Badge colorScheme="green">Capturando cada 20 min</Badge>
                    <Tooltip label={nextCaptureAt ? `Próxima captura ~ ${new Date(nextCaptureAt).toLocaleTimeString()}` : ""}>
                      <Button size="xs" onClick={() => captureFrame(d.id)}>Capturar ahora</Button>
                    </Tooltip>
                    <Button size="xs" variant="outline" onClick={() => stopScreens(d.id)}>Detener</Button>
                  </HStack>
                ) : (
                  <Button size="xs" onClick={() => startScreens(d.id)}>Screenshare</Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      </Box>

      {/* Mobile cards */}
      <Stack spacing={3} display={{ base: "block", md: "none" }}>
        {docs.map((d) => (
          <Box key={d.id} borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="md" p={3} bg="gray.800">
            <Flex align="center" mb={2}>
              <Heading size="sm" noOfLines={2}>{d.title}</Heading>
              <Spacer />
              <Badge colorScheme={d.status === "Done" ? "green" : d.status === "Development" ? "blue" : d.status === "Review" ? "purple" : "gray"}>{d.status}</Badge>
            </Flex>
            <Text fontSize="sm" color="gray.400">Inicio: {formatDate(d.startDate)}</Text>
            <Text fontSize="sm" color="gray.400">Fin: {formatDate(d.endDate)}</Text>
            <Text fontSize="sm" color="gray.400">Horas: {formatHM(activeDocId === d.id && tracking ? (baseMinutes + Math.floor(((Date.now() - (startedAt || Date.now())) / 60000))) : d.totalHours * 60)}</Text>
            {d.comments && <Text fontSize="sm" mt={2}>{d.comments}</Text>}
            <HStack mt={3}>
              {activeDocId === d.id && tracking ? (
                <>
                  <Button size="xs" onClick={() => captureFrame(d.id)}>Capturar ahora</Button>
                  <Button size="xs" variant="outline" onClick={() => stopScreens(d.id)}>Detener</Button>
                </>
              ) : (
                <Button size="xs" onClick={() => startScreens(d.id)}>Screenshare</Button>
              )}
              <StatusSelect value={d.status} onChange={(v) => saveField(d.id, "status", v)} />
            </HStack>
          </Box>
        ))}
      </Stack>

      <Modal isOpen={showShots} onClose={() => setShowShots(false)} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="gray.900" color="gray.100">
          <ModalHeader>Capturas de pantalla</ModalHeader>
          <ModalBody>
            {sessionShots.length === 0 ? (
              <Text color="gray.400">No hay capturas registradas.</Text>
            ) : (
              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={3}>
                {sessionShots.map((p, i) => (
                  <Box key={i} borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="md" overflow="hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt={`shot-${i}`} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    <Box p={2}>
                      <Button as="a" href={p} target="_blank" size="xs" variant="outline">Abrir</Button>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setShowShots(false)}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function InlineCell({
  value,
  onSave,
  isLocked,
  type = "text",
  isNumeric,
  renderView,
  editor,
}: {
  value: string;
  onSave: (val: string) => void | Promise<void>;
  isLocked: boolean;
  type?: "text" | "number" | "date";
  isNumeric?: boolean;
  renderView?: (val: string) => any;
  editor?: (val: string, commit: (v: string) => void, cancel: () => void) => any;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  useEffect(() => setVal(value || ""), [value]);

  function commit() {
    setEditing(false);
    if (val !== value) onSave(val);
  }
  function cancel() {
    setEditing(false);
    setVal(value || "");
  }

  if (editing && !isLocked) {
    if (editor) {
      const commitWith = (v: string) => {
        setEditing(false);
        if (v !== value) onSave(v);
      };
      return (
        <Td isNumeric={isNumeric}>
          {editor(val, commitWith, cancel)}
        </Td>
      );
    }
    return (
      <Td isNumeric={isNumeric} onBlur={commit}>
        <Input
          size="sm"
          autoFocus
          type={type}
          color="gray.100"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
        />
      </Td>
    );
  }

  return (
    <Td isNumeric={isNumeric} cursor={isLocked ? "default" : "pointer"} onClick={() => !isLocked && setEditing(true)}>
      {renderView ? renderView(value) : (value || "—")}
    </Td>
  );
}
