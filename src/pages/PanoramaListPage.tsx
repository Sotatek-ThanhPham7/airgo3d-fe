/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Image,
  Pagination,
  Spin,
  Alert,
  Tag,
  Typography,
  Space,
  Input,
  Select,
  Button,
  message,
  Tooltip,
  Empty,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  panoramaApi,
  Panorama,
  PanoramaTag,
} from "../services/api/panoramaApi";
import { getImageUrl, getThumbnailUrl } from "../services/api/config";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useAppDispatch } from "../store/hooks";
import { setViewerImageUrl } from "../store/viewerSlice";

const { Text } = Typography;
const { Search } = Input;

const PanoramaListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bookmarkFilter, setBookmarkFilter] = useState<
    "all" | "bookmarked" | "unbookmarked"
  >("all");

  const [tagOptions, setTagOptions] = useState<PanoramaTag[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState<string>("");
  const [tagLoading, setTagLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTagSuggestions = useCallback(async (search: string = "") => {
    setTagLoading(true);
    try {
      const response = await panoramaApi.getTagSuggestions({
        q: search,
        page: 1,
        limit: 10,
      });
      setTagOptions(response.data);
    } catch (err: any) {
      console.error("Error fetching tag suggestions:", err);
      setTagOptions([]);
    } finally {
      setTagLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTagSuggestions("");
  }, [fetchTagSuggestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTagSuggestions(tagSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearchQuery, fetchTagSuggestions]);

  const fetchPanoramas = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page,
          limit: pagination.limit,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (selectedTags.length > 0) {
          params.tags = selectedTags;
        }

        if (bookmarkFilter === "bookmarked") {
          params.isBookmarked = true;
        } else if (bookmarkFilter === "unbookmarked") {
          params.isBookmarked = false;
        }

        const response = await panoramaApi.getPanoramas(params);
        setPanoramas(response.data);
        setPagination({
          ...pagination,
          page: response.pagination.page,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });
      } catch (err: any) {
        setError(err?.message || "Failed to fetch panoramas");
        console.error("Error fetching panoramas:", err);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, selectedTags, bookmarkFilter, pagination.limit]
  );

  useEffect(() => {
    fetchPanoramas(1);
  }, [debouncedSearch, selectedTags, bookmarkFilter]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTagChange = (tags: string[]) => {
    setSelectedTags(tags);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleBookmarkFilterChange = (
    value: "all" | "bookmarked" | "unbookmarked"
  ) => {
    setBookmarkFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    fetchPanoramas(page);
  };

  const handleOpenViewer = (panorama: Panorama) => {
    const imageUrl = getImageUrl(panorama.filePath);
    dispatch(setViewerImageUrl(imageUrl));
    navigate("/panoramas/viewer");
  };

  const handleBookmarkToggle = async (panorama: Panorama) => {
    const nextIsBookmarked = !panorama.isBookmarked;

    // Optimistic UI update
    setPanoramas((prev) =>
      prev.map((item) =>
        item._id === panorama._id
          ? { ...item, isBookmarked: nextIsBookmarked }
          : item
      )
    );

    try {
      const updated = await panoramaApi.updateBookmark(panorama._id, {
        isBookmarked: nextIsBookmarked,
      });

      setPanoramas((prev) =>
        prev
          .map((item) =>
            item._id === updated._id
              ? { ...item, isBookmarked: updated.isBookmarked }
              : item
          )
          // Keep list consistent with current bookmark filter
          .filter((item) => {
            if (bookmarkFilter === "bookmarked") {
              return item.isBookmarked;
            }
            if (bookmarkFilter === "unbookmarked") {
              return !item.isBookmarked;
            }
            return true;
          })
      );

      message.success(
        updated.isBookmarked
          ? "Panorama bookmarked."
          : "Panorama removed from bookmarks."
      );
    } catch (err) {
      console.error("Failed to update bookmark:", err);

      // Revert optimistic update
      setPanoramas((prev) =>
        prev.map((item) =>
          item._id === panorama._id
            ? { ...item, isBookmarked: panorama.isBookmarked }
            : item
        )
      );

      message.error("Failed to update bookmark. Please try again.");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tagColors = [
    "blue",
    "cyan",
    "green",
    "orange",
    "purple",
    "red",
    "volcano",
    "geekblue",
  ];

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  const resultRange = useMemo(() => {
    if (pagination.total === 0) return { start: 0, end: 0 };
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return { start, end };
  }, [pagination.page, pagination.limit, pagination.total]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search + filters toolbar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1 w-full md:w-auto">
                <Search
                  placeholder="Search images..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex w-full md:w-auto gap-2 justify-end">
                <Select
                  size="middle"
                  className="w-40"
                  value={bookmarkFilter}
                  onChange={handleBookmarkFilterChange}
                  options={[
                    { label: "All items", value: "all" },
                    { label: "Bookmarked", value: "bookmarked" },
                    { label: "Unbookmarked", value: "unbookmarked" },
                  ]}
                />

                <Select
                  mode="multiple"
                  placeholder="Filter by tags"
                  size="middle"
                  value={selectedTags}
                  onChange={handleTagChange}
                  onSearch={setTagSearchQuery}
                  showSearch
                  filterOption={false}
                  loading={tagLoading}
                  allowClear
                  maxTagCount="responsive"
                  suffixIcon={<FilterOutlined />}
                  className="w-48"
                  options={tagOptions.map((tag) => ({
                    label: tag.name,
                    value: tag.name,
                  }))}
                />
              </div>
            </div>

            {/* Primary action */}
            <div className="flex justify-end">
              <Link to="/panoramas/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  Create panorama
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]} className="mb-6">
              {panoramas.map((panorama) => (
                <Col key={panorama._id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    onClick={() => handleOpenViewer(panorama)}
                    className="h-full rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    bodyStyle={{ padding: 12 }}
                    cover={
                      <div className="relative h-48 bg-gray-200 overflow-hidden p-0 m-0">
                        <Image
                          alt={panorama.name}
                          src={getThumbnailUrl(panorama.thumbnailPath ?? "")}
                          className="object-cover w-full h-full"
                          style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                          }}
                          preview={false}
                          rootClassName="w-full h-full"
                          loading="lazy"
                        />
                        <Tooltip
                          title={
                            panorama.isBookmarked
                              ? "Remove bookmark"
                              : "Add to bookmarks"
                          }
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmarkToggle(panorama);
                            }}
                            className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-white/90 px-2 py-1 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                          >
                            {panorama.isBookmarked ? (
                              <FaBookmark className="text-red-500 text-lg" />
                            ) : (
                              <FaRegBookmark className="text-gray-400 text-lg" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <Text strong className="text-gray-800">
                          {panorama.name}
                        </Text>
                      }
                      description={
                        <Space
                          direction="vertical"
                          size="small"
                          className="w-full"
                        >
                          {panorama.tags && panorama.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {panorama.tags.map((tag, index) => (
                                <Tag
                                  key={tag._id}
                                  color={getTagColor(index)}
                                  className="m-0"
                                >
                                  {tag.name}
                                </Tag>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Size: {formatFileSize(panorama.fileSize)}</div>
                            <div>Created: {formatDate(panorama.createdAt)}</div>
                          </div>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {panoramas.length === 0 && !loading && (
              <div className="py-16">
                <Empty
                  description={
                    <span className="text-gray-500">
                      No panoramas found. Try changing filters or create a new
                      one.
                    </span>
                  }
                >
                  <Link to="/panoramas/new">
                    <Button type="primary">Create panorama</Button>
                  </Link>
                </Empty>
              </div>
            )}
          </>
        )}

        {pagination.total > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600">
                <Text>
                  Showing {resultRange.start}-{resultRange.end} of{" "}
                  {pagination.total} results
                </Text>
              </div>

              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                className="custom-pagination"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PanoramaListPage;
