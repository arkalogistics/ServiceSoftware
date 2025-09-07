"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  useToast,
  Progress,
  Tag,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useSession } from "next-auth/react";

const MotionBox = motion(Box);

type Party = {
  isCompany: boolean;
  name: string;
  email: string;
  phone: string;
  rfc: string;
  address: string;
};

const initialParty: Party = {
  isCompany: false,
  name: "",
  email: "",
  phone: "",
  rfc: "",
  address: "",
};

export default function ProjectWizard() {
  const [step, setStep] = useState(0);
  const steps = ["Proyecto", "Cliente", "Prestador", "Resumen"] as const;
  const progress = ((step + 1) / steps.length) * 100;
  const toast = useToast();
  const router = useRouter();
  const session = useSession();

  // Step 1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("Sitio web / app");
  const [billing, setBilling] = useState("fixed");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Step 2 & 3
  const [client, setClient] = useState<Party>({ ...initialParty });
  const [provider, setProvider] = useState<Party>({ ...initialParty });

  useEffect(() => {
    if (session.status === "authenticated" && !provider.name) {
      setProvider((p) => ({ ...p, name: session.data.user?.name || p.name }));
    }
  }, [session.status]);

  function validateCurrent(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!title.trim()) errs.title = "El título es obligatorio";
      if (title.length > 100) errs.title = "Máximo 100 caracteres";
    }
    if (step === 1) {
      if (!client.name.trim()) errs.clientName = "Nombre o razón social";
      if (client.isCompany && !client.rfc.trim()) errs.clientRfc = "RFC requerido para empresa";
    }
    if (step === 2) {
      if (!provider.name.trim()) errs.providerName = "Tu nombre o razón social";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validateCurrent()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function uploadCover(): Promise<string | undefined> {
    if (!cover) return undefined;
    const fd = new FormData();
    fd.append("file", cover);
    fd.append("subdir", "covers");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Error subiendo portada");
    return j.path as string;
  }

  async function createProject() {
    if (!validateCurrent()) return;
    let coverPath: string | undefined = undefined;
    if (cover) {
      try { coverPath = await uploadCover(); } catch {}
    }
    const createRes = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, coverImage: coverPath }),
    });
    if (!createRes.ok) {
      toast({ status: "error", title: "No se pudo crear el proyecto" });
      return;
    }
    const { project } = await createRes.json();

    // Save minimal KYC info when present
    const ops: Promise<any>[] = [];
    if (client.name.trim()) {
      ops.push(
        fetch("/api/kyc/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            role: client.isCompany ? "company" : "client",
            name: client.name,
            email: client.email,
            phone: client.phone,
            rfc: client.rfc,
            address: client.address,
            isCompany: client.isCompany,
          }),
        })
      );
    }
    if (provider.name.trim()) {
      ops.push(
        fetch("/api/kyc/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            role: "provider",
            name: provider.name,
            email: provider.email,
            phone: provider.phone,
            rfc: provider.rfc,
            address: provider.address,
            isCompany: provider.isCompany,
          }),
        })
      );
    }
    if (ops.length) await Promise.allSettled(ops);

    toast({ status: "success", title: "Proyecto creado" });
    router.push(`/projects/${project.id}` as Route);
  }

  const Summary = useMemo(() => (
    <Stack spacing={3} fontSize="sm">
      <HStack justify="space-between"><Text color="gray.500">Título</Text><Text fontWeight="medium">{title || "—"}</Text></HStack>
      <HStack justify="space-between"><Text color="gray.500">Alcance</Text><Text fontWeight="medium">{scope || "—"}</Text></HStack>
      <HStack justify="space-between"><Text color="gray.500">Cobro</Text><Text fontWeight="medium">{billing === "fixed" ? "Precio fijo" : "Por hora"}</Text></HStack>
      <Divider />
      <Text fontWeight="medium">Cliente</Text>
      <Text>{client.name || "—"}</Text>
      <Text color="gray.400">{client.email || client.phone ? `${client.email} ${client.phone}` : ""}</Text>
      <Text color="gray.400">{client.isCompany ? `Empresa · RFC ${client.rfc || "—"}` : "Persona"}</Text>
      <Divider />
      <Text fontWeight="medium">Prestador</Text>
      <Text>{provider.name || "—"}</Text>
      <Text color="gray.400">{provider.email || provider.phone ? `${provider.email} ${provider.phone}` : ""}</Text>
    </Stack>
  ), [title, scope, billing, client, provider]);

  return (
    <Box maxW="6xl" mx="auto" py={8}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg">Registrar proyecto</Heading>
          <Text color="gray.400">Un flujo sencillo en pasos para capturar lo esencial y comenzar rápido.</Text>
        </Box>

        <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <Card variant="outline">
            <CardHeader pb={0}>
              <HStack spacing={3}>
                {steps.map((label, idx) => (
                  <HStack key={label} opacity={idx <= step ? 1 : 0.5}>
                    <Tag colorScheme={idx <= step ? "blue" : "gray"} borderRadius="full">{idx + 1}</Tag>
                    <Text fontWeight={idx === step ? "bold" : "medium"}>{label}</Text>
                    {idx < steps.length - 1 && <Divider orientation="vertical" h={6} />}
                  </HStack>
                ))}
              </HStack>
            </CardHeader>
            <CardBody>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <MotionBox key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Stack spacing={4}>
                      <FormControl isRequired isInvalid={!!errors.title}>
                        <FormLabel>Título del proyecto</FormLabel>
                        <Input placeholder="p.ej. Sitio corporativo y panel admin" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                        {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Descripción</FormLabel>
                        <Textarea placeholder="Breve objetivo, entregables, stakeholders..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Alcance</FormLabel>
                        <Input value={scope} onChange={(e) => setScope(e.target.value)} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Facturación</FormLabel>
                        <RadioGroup value={billing} onChange={(v) => setBilling(v)}>
                          <HStack>
                            <Radio value="fixed">Precio fijo</Radio>
                            <Radio value="hourly">Por hora</Radio>
                          </HStack>
                        </RadioGroup>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Imagen de portada</FormLabel>
                        <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setCover(f); setCoverPreview(f ? URL.createObjectURL(f) : null); }} />
                      </FormControl>
                    </Stack>
                  </MotionBox>
                )}
                {step === 1 && (
                  <MotionBox key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Stack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">¿Es empresa?</FormLabel>
                        <Switch isChecked={client.isCompany} onChange={(e) => setClient((c) => ({ ...c, isCompany: e.target.checked }))} />
                      </FormControl>
                      <FormControl isRequired isInvalid={!!errors.clientName}>
                        <FormLabel>{client.isCompany ? "Razón social" : "Nombre completo"}</FormLabel>
                        <Input value={client.name} onChange={(e) => setClient((c) => ({ ...c, name: e.target.value }))} />
                        {errors.clientName && <FormErrorMessage>{errors.clientName}</FormErrorMessage>}
                      </FormControl>
                      <HStack>
                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input type="email" value={client.email} onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Teléfono</FormLabel>
                          <Input value={client.phone} onChange={(e) => setClient((c) => ({ ...c, phone: e.target.value }))} />
                        </FormControl>
                      </HStack>
                      <HStack>
                        <FormControl isInvalid={!!errors.clientRfc}>
                          <FormLabel>RFC</FormLabel>
                          <Input value={client.rfc} onChange={(e) => setClient((c) => ({ ...c, rfc: e.target.value.toUpperCase() }))} />
                          {errors.clientRfc && <FormErrorMessage>{errors.clientRfc}</FormErrorMessage>}
                        </FormControl>
                        <FormControl>
                          <FormLabel>Domicilio</FormLabel>
                          <Input value={client.address} onChange={(e) => setClient((c) => ({ ...c, address: e.target.value }))} />
                        </FormControl>
                      </HStack>
                    </Stack>
                  </MotionBox>
                )}
                {step === 2 && (
                  <MotionBox key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Stack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">¿Eres empresa?</FormLabel>
                        <Switch isChecked={provider.isCompany} onChange={(e) => setProvider((p) => ({ ...p, isCompany: e.target.checked }))} />
                      </FormControl>
                      <FormControl isRequired isInvalid={!!errors.providerName}>
                        <FormLabel>Nombre/Razón social</FormLabel>
                        <Input value={provider.name} onChange={(e) => setProvider((p) => ({ ...p, name: e.target.value }))} />
                        {errors.providerName && <FormErrorMessage>{errors.providerName}</FormErrorMessage>}
                      </FormControl>
                      <HStack>
                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input type="email" value={provider.email} onChange={(e) => setProvider((p) => ({ ...p, email: e.target.value }))} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Teléfono</FormLabel>
                          <Input value={provider.phone} onChange={(e) => setProvider((p) => ({ ...p, phone: e.target.value }))} />
                        </FormControl>
                      </HStack>
                      <HStack>
                        <FormControl>
                          <FormLabel>RFC</FormLabel>
                          <Input value={provider.rfc} onChange={(e) => setProvider((p) => ({ ...p, rfc: e.target.value.toUpperCase() }))} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Domicilio</FormLabel>
                          <Input value={provider.address} onChange={(e) => setProvider((p) => ({ ...p, address: e.target.value }))} />
                        </FormControl>
                      </HStack>
                    </Stack>
                  </MotionBox>
                )}
                {step === 3 && (
                  <MotionBox key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Stack spacing={4}>
                      <Text color="gray.600">Revisa el resumen antes de crear. Podrás completar KYC, contrato y subir archivos después.</Text>
                      {Summary}
                    </Stack>
                  </MotionBox>
                )}
              </AnimatePresence>
              <Divider my={6} />
              <Flex justify="space-between">
                <Button onClick={back} isDisabled={step === 0} variant="ghost">Atrás</Button>
                {step < steps.length - 1 ? (
                  <Button colorScheme="blue" onClick={next}>Continuar</Button>
                ) : (
                  <Button colorScheme="blue" onClick={createProject}>Crear proyecto</Button>
                )}
              </Flex>
            </CardBody>
          </Card>

          <Card variant="outline" bg="gray.800" borderColor="whiteAlpha.200">
            <CardHeader>
              <Heading size="md">Vista previa</Heading>
              <Text color="gray.400">Se actualiza conforme avanzas</Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500">PROYECTO</Text>
                  <Heading size="sm" mt={1}>{title || "Sin título"}</Heading>
                  {description && <Text color="gray.300" mt={1}>{description}</Text>}
                  {coverPreview && (
                    <Box mt={3} borderRadius="md" overflow="hidden" borderWidth="1px" borderColor="whiteAlpha.200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverPreview} alt="Portada" style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    </Box>
                  )}
                </Box>
                <Divider />
                {Summary}
                <Divider />
                <Text color="gray.500" fontSize="sm">Después de crear podrás:</Text>
                <Stack spacing={1} fontSize="sm">
                  <Text>• Subir INE y comprobantes</Text>
                  <Text>• Editar y firmar el contrato</Text>
                  <Text>• Crear documentos/tareas del proyecto</Text>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}
